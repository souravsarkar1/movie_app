import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MovieData } from '../types';

const TMDB_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5Y2VlMmNlYTQ2MGQ1NTM0YWVjNDhhZjQwZjkyNzRlNiIsIm5iZiI6MTc2MzA2MDEyMS45Njg5OTk5LCJzdWIiOiI2OTE2Mjk5OTlkZTQ5ODhiYjQ0MGU0MjYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jliIGDR8Y1lkox8S8mCGRWv2MgXlWdfnwwTV3XNlAk4";

export interface MovieState {
  trendingMovies: MovieData[];
  watchlist: MovieData[];
  loading: boolean;
  loadingMore: boolean; 
  error: string | null;
  page: number;
  totalPages: number;
  refreshing: boolean;
  hasMore: boolean; 
}

const initialState: MovieState = {
  trendingMovies: [],
  watchlist: [],
  loading: false,
  loadingMore: false,
  error: null,
  page: 1,
  totalPages: 1,
  refreshing: false,
  hasMore: true,
};

export const fetchTrendingMovies = createAsyncThunk(
  'movies/fetchTrending',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?page=${page}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_READ_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      return {
        movies: data.results,
        page: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

export const fetchMoreMovies = createAsyncThunk(
  'movies/fetchMore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { movies: MovieState };
      const nextPage = state.movies.page + 1;
      
      if (nextPage > state.movies.totalPages) {
        return rejectWithValue('No more pages available');
      }


      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?page=${nextPage}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_READ_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch more movies');
      }

      const data = await response.json();
      
      return {
        movies: data.results,
        page: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

export const loadWatchlist = createAsyncThunk(
  'movies/loadWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const watchlistJson = await AsyncStorage.getItem('watchlist');
      const watchlist: MovieData[] = watchlistJson ? JSON.parse(watchlistJson) : [];
      return watchlist;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load watchlist');
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'movies/addToWatchlist',
  async (movie: MovieData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { movies: MovieState };
      const updatedWatchlist = [...state.movies.watchlist, movie];
      await AsyncStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      return movie;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to watchlist');
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'movies/removeFromWatchlist',
  async (movieId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { movies: MovieState };
      const updatedWatchlist = state.movies.watchlist.filter((movie) => movie.id !== movieId);
      await AsyncStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      return movieId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from watchlist');
    }
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    resetMovies: (state) => {
      state.trendingMovies = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        
        state.trendingMovies = action.payload.movies;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchTrendingMovies.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMoreMovies.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreMovies.fulfilled, (state, action) => {
        state.loadingMore = false;
        
        state.trendingMovies = [...state.trendingMovies, ...action.payload.movies];
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.page < action.payload.totalPages;   
      })
      .addCase(fetchMoreMovies.rejected, (state, action) => {
        state.loadingMore = false;
        if (action.payload === 'No more pages available') {
          state.hasMore = false;
        } else {
          state.error = action.payload as string;
        }
      });

    builder
      .addCase(loadWatchlist.fulfilled, (state, action) => {
        state.watchlist = action.payload;
      })
      .addCase(loadWatchlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.watchlist.push(action.payload);
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter((movie) => movie.id !== action.payload);
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setRefreshing, resetMovies } = movieSlice.actions;
export default movieSlice.reducer;