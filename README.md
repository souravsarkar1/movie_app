# Movie App with Redux Toolkit - Setup Guide

## File Structure

```
src/
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── movieSlice.ts
│   ├── types.ts
│   ├── store.ts
│   └── hooks.ts
├── screens/
│   └── MoviesScreen.tsx
```

## Installation

Make sure you have all required dependencies installed:

```bash
npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage
npm install expo-linear-gradient @expo/vector-icons
```

## Setup Instructions

### 1. Add movieSlice to your store

Update your `store/slices/movieSlice.ts` with the provided code.

### 2. Update your store configuration

Update your `store/store.ts` to include the movies reducer:

```typescript
const rootReducer = combineReducers({
  auth: authReducer,
  movies: movieReducer, // Add this line
});
```

### 3. Update your types file

Make sure your `store/types.ts` includes the MovieData interface:

```typescript
export interface MovieData {
  adult: boolean;
  backdrop_path: string;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
```

### 4. Replace your MoviesScreen

Replace your existing `MoviesScreen.tsx` with the new implementation.

### 5. Wrap your app with Redux Provider

In your `App.tsx` or main entry file:

```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Your app navigation */}
      </PersistGate>
    </Provider>
  );
}
```

## Features

### 1. **Trending Movies**
- Fetches monthly trending movies from TMDB API
- Displays in an animated carousel with smooth transitions
- Shows movie poster, title, rating, and release year
- Pull-to-refresh functionality

### 2. **Watchlist Management**
- Add/remove movies from watchlist with a single tap
- Watchlist persisted in AsyncStorage
- Toggle between "Trending" and "Watchlist" tabs
- Swipeable list items in watchlist view

### 3. **Redux State Management**
- Centralized state management with Redux Toolkit
- Async thunks for API calls and AsyncStorage operations
- Automatic state persistence with redux-persist

### 4. **Animations**
- Smooth fade-in animations on mount
- Scale and opacity animations for carousel cards
- Animated pagination dots
- Smooth tab transitions

## API Configuration

The app uses TMDB API v3. The API key and read token are already configured in the movieSlice:

```typescript
const TMDB_API_KEY = '9cee2cea460d5534aec48af40f9274e6';
const TMDB_READ_TOKEN = 'your-token-here';
```

### API Endpoints Used:
- `/trending/movie/month` - Fetch monthly trending movies

## Redux Actions

### Async Thunks:

1. **fetchTrendingMovies(page)** - Fetch trending movies from TMDB
2. **loadWatchlist()** - Load watchlist from AsyncStorage
3. **addToWatchlist(movie)** - Add a movie to watchlist
4. **removeFromWatchlist(movieId)** - Remove a movie from watchlist

### Synchronous Actions:

1. **clearError()** - Clear error state
2. **setRefreshing(boolean)** - Set refreshing state
3. **resetMovies()** - Reset movies list and page number

## Usage Examples

### Adding a movie to watchlist:

```typescript
import { useDispatch } from 'react-redux';
import { addToWatchlist } from './store/slices/movieSlice';

const dispatch = useDispatch();

const handleAddToWatchlist = (movie) => {
  dispatch(addToWatchlist(movie));
};
```

### Fetching movies:

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingMovies } from './store/slices/movieSlice';

const dispatch = useDispatch();
const { trendingMovies, loading } = useSelector((state) => state.movies);

useEffect(() => {
  dispatch(fetchTrendingMovies(1));
}, []);
```

### Checking if movie is in watchlist:

```typescript
const { watchlist } = useSelector((state) => state.movies);

const isInWatchlist = (movieId) => {
  return watchlist.some((m) => m.id === movieId);
};
```

## State Shape

```typescript
{
  movies: {
    trendingMovies: MovieData[],
    watchlist: MovieData[],
    loading: boolean,
    error: string | null,
    page: number,
    totalPages: number,
    refreshing: boolean
  }
}
```

## Styling

The app uses:
- Linear gradients for headers and cards
- Shadow effects for depth
- Responsive design with Dimensions API
- Animated values for smooth transitions

## Future Enhancements

1. **Pagination/Infinite Scroll** - Load more movies as user scrolls
2. **Search Functionality** - Search movies by title
3. **Genre Filtering** - Filter movies by categories
4. **Movie Details Screen** - Detailed view with cast, reviews, etc.
5. **User Reviews** - Add and view community reviews
6. **Dark Mode** - Toggle between light and dark themes

## Troubleshooting

### Movies not loading?
- Check your internet connection
- Verify TMDB API key is valid
- Check console for error messages

### Watchlist not persisting?
- Ensure AsyncStorage permissions are granted
- Check if redux-persist is properly configured
- Verify PersistGate is wrapping your app

### TypeScript errors?
- Make sure all types are properly imported
- Check that store types match the actual state shape
- Verify MovieData interface matches TMDB API response

## License

This project is for educational purposes as part of a React Native code challenge.