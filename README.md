# 🎬 Movie App - Expo React Native

A beautiful, feature-rich movie application built with Expo, React Native, Redux Toolkit, and TMDB API. Browse trending movies, manage your watchlist, and enjoy a stunning UI with glassmorphism effects and smooth animations.



## ✨ Features

- 🎥 **Trending Movies**: Browse weekly trending movies from TMDB
- 📚 **Watchlist Management**: Save your favorite movies for later
- 🔄 **Infinite Scroll**: Load more movies seamlessly as you scroll
- 🔃 **Pull to Refresh**: Refresh movie list with a simple pull gesture
- 🎨 **Beautiful UI**: Glassmorphism tab bar with gradient effects
- 🌊 **Smooth Animations**: Spring animations and haptic feedback
- 🔔 **Toast Notifications**: Elegant notifications for user actions
- 💾 **Persistent Storage**: Watchlist saved locally with AsyncStorage
- 🔐 **Authentication**: Login and signup functionality
- 📱 **Responsive Design**: Optimized for all screen sizes

## 📁 Project Structure

```
.
├── app/
│   ├── (tabs)/
│   │   ├── movies/
│   │   │   └── index.tsx          # Movies screen
│   │   ├── _layout.tsx             # Tab bar layout
│   │   ├── profile.tsx             # Profile screen
│   │   └── watchlist.tsx           # Watchlist screen
│   ├── _layout.tsx                 # Root layout with Redux Provider
│   ├── index.tsx                   # Welcome/Home screen
│   ├── login.tsx                   # Login screen
│   └── signup.tsx                  # Signup screen
├── redux/
│   ├── slices/
│   │   ├── authSlice.ts            # Authentication state
│   │   └── movieSlice.ts           # Movies & watchlist state
│   ├── hooks.ts                    # Typed Redux hooks
│   ├── store.ts                    # Redux store configuration
│   └── types.ts                    # TypeScript type definitions
├── components/
│   └── Loader.tsx                  # Loading component
├── assets/
│   └── images/                     # App images and icons
├── .env                            # Environment variables
└── package.json                    # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app on your mobile device (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/souravsarkar1/movie_app
   cd movie_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install required Expo packages**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   npx expo install expo-linear-gradient
   npx expo install expo-blur
   npx expo install expo-haptics
   npx expo install react-native-safe-area-context
   npx expo install react-native-toast-message
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_KEY=your_api_key_here
   ```

   Get your TMDB API credentials from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "expo-router": "~3.5.0"
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "redux-persist": "^6.0.0"
}
```

### UI & Animations
```json
{
  "expo-linear-gradient": "~13.0.2",
  "expo-blur": "~13.0.2",
  "expo-haptics": "~13.0.1",
  "@expo/vector-icons": "^14.0.0",
  "react-native-toast-message": "^2.2.0"
}
```

### Storage
```json
{
  "@react-native-async-storage/async-storage": "1.23.1"
}
```

## 🏗️ Architecture

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  movies: {
    trendingMovies: MovieData[],
    watchlist: MovieData[],
    loading: boolean,
    loadingMore: boolean,
    error: string | null,
    page: number,
    totalPages: number,
    refreshing: boolean,
    hasMore: boolean
  }
}
```

### Type Definitions

**MovieData Interface:**
```typescript
interface MovieData {
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

## 🎯 Redux Actions

### Movie Slice Actions

**Async Thunks:**
- `fetchTrendingMovies(page)` - Fetch trending movies from TMDB
- `fetchMoreMovies()` - Load next page of movies (infinite scroll)
- `loadWatchlist()` - Load watchlist from AsyncStorage
- `addToWatchlist(movie)` - Add movie to watchlist
- `removeFromWatchlist(movieId)` - Remove movie from watchlist

**Synchronous Actions:**
- `clearError()` - Clear error state
- `setRefreshing(boolean)` - Set refreshing state
- `resetMovies()` - Reset movies list and pagination

### Usage Examples

```typescript
// In your component
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingMovies, addToWatchlist } from '@/redux/slices/movieSlice';
import { AppDispatch, RootState } from '@/redux/store';

const dispatch = useDispatch<AppDispatch>();
const { trendingMovies, loading } = useSelector((state: RootState) => state.movies);

// Fetch movies
useEffect(() => {
  dispatch(fetchTrendingMovies(1));
}, []);

// Add to watchlist
const handleAddToWatchlist = (movie: MovieData) => {
  dispatch(addToWatchlist(movie));
};
```

## 🎨 Key Features Explained

### 1. Infinite Scroll
The app implements efficient infinite scrolling using `FlatList`'s `onEndReached` callback with momentum handling to prevent duplicate requests.

```typescript
const handleLoadMore = useCallback(() => {
  if (!loading && !loadingMore && hasMore) {
    dispatch(fetchMoreMovies());
  }
}, [loading, loadingMore, hasMore]);
```

### 2. Pull to Refresh
Users can refresh the movie list by pulling down on the screen.

```typescript
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={["#FF6B9D"]}
  tintColor="#FF6B9D"
/>
```

### 3. Glassmorphism Tab Bar
Beautiful liquid glass effect tab bar with blur effects (iOS) and gradient fallback (Android).

- Uses `expo-blur` for iOS
- Custom gradient for Android
- Haptic feedback on tab press
- Spring animations on focus

### 4. Toast Notifications
Elegant toast messages for user feedback using `react-native-toast-message`.

```typescript
Toast.show({
  type: "success",
  text1: "Added",
  text2: `${movie.title} added to watchlist`
});
```

### 5. Redux Persist
Watchlist is automatically persisted to AsyncStorage and rehydrated on app launch.

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['movies'] // Only persist movies slice
};
```

## 🔧 Configuration

### TMDB API Setup

The app uses TMDB API v3. Update the API credentials in `redux/slices/movieSlice.ts`:

```typescript
const TMDB_READ_TOKEN = "your_token_here";
```

**API Endpoints Used:**
- `GET /trending/movie/week` - Fetch weekly trending movies

## 🎭 Animations

The app features several smooth animations:

1. **Header Animations**: Shrinking header on scroll
2. **Tab Bar Animations**: Scale and translateY on focus
3. **Card Animations**: Fade-in animations on mount
4. **Loading States**: Activity indicators with text
5. **Haptic Feedback**: Tactile responses on interactions

## 🐛 Troubleshooting

### Movies not loading?
- ✅ Check your internet connection
- ✅ Verify TMDB API credentials are correct
- ✅ Check console for error messages
- ✅ Ensure you're using the correct API endpoint

### Toast not showing?
- ✅ Ensure `<Toast />` is rendered at root level AFTER Stack
- ✅ Check if Toast is not covered by other components
- ✅ Verify react-native-toast-message is installed

### Watchlist not persisting?
- ✅ Check AsyncStorage permissions
- ✅ Verify PersistGate is wrapping your app
- ✅ Check if redux-persist is properly configured

### Infinite scroll not working?
- ✅ Verify `hasMore` flag is being updated correctly
- ✅ Check `onEndReachedThreshold` value
- ✅ Ensure momentum handling is implemented

## 🚧 Future Enhancements

- [ ] Movie details screen with full information
- [ ] Search functionality
- [ ] Genre filtering
- [ ] Sort options (rating, popularity, release date)
- [ ] Dark mode support
- [ ] User reviews and ratings
- [ ] Movie trailers integration
- [ ] Share movie functionality
- [ ] Offline mode
- [ ] Multi-language support

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

- GitHub: (https://github.com/souravsarkar1)
- LinkedIn: (https://www.linkedin.com/in/sourav-sarkar-2b5a2a212/)
- Portfolio: (https://souravsarkar1.github.io/)

## 🙏 Acknowledgments

## Video Link

[![Watch Video](https://vumbnail.com/1137386118.jpg)](https://vimeo.com/1137386118)


- [TMDB API](https://www.themoviedb.org/) for movie data
- [Expo](https://expo.dev/) for the amazing development experience
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management

---

Made with ❤️ using React Native & Expo
