import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MovieData } from '../types';

// API Configuration
const TMDB_READ_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5Y2VlMmNlYTQ2MGQ1NTM0YWVjNDhhZjQwZjkyNzRlNiIsIm5iZiI6MTc2MzA2MDEyMS45Njg5OTk5LCJzdWIiOiI2OTE2Mjk5OTlkZTQ5ODhiYjQ0MGU0MjYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jliIGDR8Y1lkox8S8mCGRWv2MgXlWdfnwwTV3XNlAk4';

// Movie state interface
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

// Initial state
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

// Async thunk to fetch trending movies with page parameter
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

// New: Async thunk specifically for loading more movies (pagination)
export const fetchMoreMovies = createAsyncThunk(
  'movies/fetchMore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { movies: MovieState };
      const nextPage = state.movies.page + 1;
      
      // Don't fetch if already loading more or if we've reached the end
      if (state.movies.loadingMore) {
        return rejectWithValue('Already loading');
      }
      
      if (nextPage > state.movies.totalPages) {
        return rejectWithValue('No more pages available');
      }

      console.log(`Fetching page ${nextPage}...`);

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
      console.log(`Fetched ${data.results.length} movies for page ${nextPage}`);
      
      return {
        movies: data.results,
        page: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      console.error('Error fetching more movies:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

// Async thunk to load watchlist from AsyncStorage
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

// Async thunk to add movie to watchlist
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

// Async thunk to remove movie from watchlist
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
    // Fetch trending movies (initial load or refresh)
    builder
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        
        // Replace the movies for page 1 (refresh scenario)
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

    // Fetch more movies (pagination)
    builder
      .addCase(fetchMoreMovies.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreMovies.fulfilled, (state, action) => {
        state.loadingMore = false;
        
        // Append new movies to existing list
        state.trendingMovies = [...state.trendingMovies, ...action.payload.movies];
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchMoreMovies.rejected, (state, action) => {
        state.loadingMore = false;
        state.hasMore = false;
        // Don't set error for "no more pages" case
        if (action.payload !== 'No more pages available') {
          state.error = action.payload as string;
        }
      });

    // Load watchlist
    builder
      .addCase(loadWatchlist.fulfilled, (state, action) => {
        state.watchlist = action.payload;
      })
      .addCase(loadWatchlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Add to watchlist
    builder
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.watchlist.push(action.payload);
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Remove from watchlist
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