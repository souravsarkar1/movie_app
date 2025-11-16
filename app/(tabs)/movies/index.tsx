import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWatchlist,
  fetchMoreMovies,
  fetchTrendingMovies,
  loadWatchlist,
  removeFromWatchlist,
  setRefreshing,
} from "../../../redux/slices/movieSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { MovieData } from "../../../redux/types";

const { width } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const ITEM_WIDTH = (width - 45) / 2;
const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const MoviesScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    trendingMovies,
    watchlist,
    loading,
    loadingMore,
    error,
    refreshing,
    hasMore,
    page,
    totalPages,
  } = useSelector((state: RootState) => state.movies);

  const scrollY = useRef(new Animated.Value(0)).current;
  const onEndReachedCalledDuringMomentum = useRef(true);

  useEffect(() => {
    dispatch(fetchTrendingMovies(1));
    dispatch(loadWatchlist());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    dispatch(fetchTrendingMovies(1));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (onEndReachedCalledDuringMomentum.current) {
      return;
    }

    if (!loading && !loadingMore && hasMore) {
      dispatch(fetchMoreMovies());
      onEndReachedCalledDuringMomentum.current = true;
    }
  }, [loading, loadingMore, hasMore, dispatch, page, totalPages, trendingMovies.length]);

  const handleToggleWatchlist = useCallback((movie: MovieData, event: any) => {
    event.stopPropagation();
    
    const isInWatchlist = watchlist.some((m) => m.id === movie.id);

    if (isInWatchlist) {
      dispatch(removeFromWatchlist(movie.id));
      Toast.show({
        type: "error",
        text1: "Removed",
        text2: `${movie.title} removed from watchlist`
      });
    } else {
      dispatch(addToWatchlist(movie));
      Toast.show({
        type: "success",
        text1: "Added",
        text2: `${movie.title} added to watchlist`
      });
    }
  }, [watchlist, dispatch]);

  const handleMoviePress = useCallback((movieId: number) => {
    router.push(`/movies/${movieId}`);
  }, [router]);

  const isInWatchlist = useCallback((movieId: number) => {
    return watchlist.some((m) => m.id === movieId);
  }, [watchlist]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerTitleSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [28, 20],
    extrapolate: 'clamp',
  });

  const headerSubtitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const searchButtonScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderMovieItem = useCallback(({ item, index }: { item: MovieData; index: number }) => {
    const inWatchlist = watchlist.some((m) => m.id === item.id);
    
    return (
      <View style={styles.movieItem}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.movieCard}
          onPress={() => handleMoviePress(item.id)}
        >
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.movieGradient}
          >
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.movieMeta}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {item.vote_average.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.yearText}>
                {item.release_date
                  ? new Date(item.release_date).getFullYear()
                  : "N/A"}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={(e) => handleToggleWatchlist(item, e)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={inWatchlist ? "bookmark" : "bookmark-outline"}
            size={20}
            color="#FF6B9D"
          />
        </TouchableOpacity>
      </View>
    );
  }, [watchlist, handleToggleWatchlist, handleMoviePress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.footerLoaderText}>Loading more movies...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="film-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No movies found</Text>
        <Text style={styles.emptyText}>Try refreshing the page</Text>
      </View>
    );
  }, [loading]);

  const keyExtractor = useCallback((item: MovieData) => item.id.toString(), []);

  if (loading && trendingMovies.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#FF6B9D", "#FEC163"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Trending Movies</Text>
              </View>
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stickyHeader, { height: headerHeight }]}>
        <LinearGradient
          colors={["#FF6B9D", "#FEC163"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Animated.Text 
                  style={[
                    styles.headerTitle,
                    { fontSize: headerTitleSize }
                  ]}
                >
                  Trending Movies
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.headerSubtitle,
                    { opacity: headerSubtitleOpacity }
                  ]}
                >
                  {trendingMovies.length} movies • Page {page} of {totalPages}
                </Animated.Text>
              </View>
              <Animated.View style={{ transform: [{ scale: searchButtonScale }] }}>
                <TouchableOpacity 
                  style={styles.searchButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.FlatList
        data={trendingMovies}
        renderItem={renderMovieItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B9D"]}
            tintColor="#FF6B9D"
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingTop: HEADER_MAX_HEIGHT + 15 }
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginTop: 5,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  row: {
    paddingHorizontal: 15,
    justifyContent: "space-between",
    marginBottom: 15,
  },
  movieItem: {
    width: ITEM_WIDTH,
    marginBottom: 0,
  },
  movieCard: {
    width: "100%",
    height: 280,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  moviePoster: {
    width: "100%",
    height: "100%",
  },
  movieGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    justifyContent: "flex-end",
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  movieMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },
  yearText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
  },
  watchlistButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  footerLoader: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLoaderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
});

export default MoviesScreen;