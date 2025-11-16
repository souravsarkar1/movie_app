import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  loadWatchlist,
  removeFromWatchlist,
} from "../../redux/slices/movieSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { MovieData } from "../../redux/types";

const { width, height } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const ITEM_HEIGHT = 180;
const SWIPE_THRESHOLD = -width * 0.3;
const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface WatchlistItemProps {
  movie: MovieData;
  index: number;
  onDelete: (movieId: number) => void;
}

const AnimatedWatchlistItem: React.FC<WatchlistItemProps> = ({
  movie,
  index,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onDelete(movie.id);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert(
      "Remove from Watchlist",
      `Remove "${movie.title}" from your watchlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onDelete(movie.id);
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.deleteBackground}>
        <LinearGradient
          colors={["#FF6B9D", "#FF3D71"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.deleteGradient}
        >
          <Ionicons name="trash-outline" size={28} color="#fff" />
          <Text style={styles.deleteText}>Remove</Text>
        </LinearGradient>
      </View>

      <Animated.View
        style={[
          styles.itemContent,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.95} style={styles.movieCard}>
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)"]}
              style={styles.posterGradient}
            />
          </View>

          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {movie.title}
            </Text>

            <View style={styles.metaContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
              <View style={styles.yearBadge}>
                <Ionicons name="calendar-outline" size={12} color="#666" />
                <Text style={styles.yearText}>
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "N/A"}
                </Text>
              </View>
            </View>

            <Text style={styles.overview} numberOfLines={2}>
              {movie.overview || "No description available"}
            </Text>

            <View style={styles.bottomInfo}>
              <View style={styles.genreBadge}>
                <Ionicons name="film-outline" size={11} color="#4CAF50" />
                <Text style={styles.genreText}>
                  {movie.genre_ids?.length || 0} genres
                </Text>
              </View>
              <View style={styles.popularityBadge}>
                <Ionicons name="trending-up" size={11} color="#FF6B9D" />
                <Text style={styles.popularityText}>
                  {Math.round(movie.popularity)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={26} color="#FF6B9D" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const WatchlistScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { watchlist } = useSelector((state: RootState) => state.movies);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "title">("recent");

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

  const sortContainerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const badgeScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    dispatch(loadWatchlist());

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  const handleDelete = useCallback(
    (movieId: number) => {
      dispatch(removeFromWatchlist(movieId));
    },
    [dispatch]
  );

  const sortedWatchlist = React.useMemo(() => {
    const sorted = [...watchlist];
    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [watchlist, sortBy]);

  const renderSortButton = (
    type: "recent" | "rating" | "title",
    icon: string,
    label: string
  ) => {
    const isActive = sortBy === type;
    return (
      <TouchableOpacity
        style={[styles.sortButton, isActive && styles.sortButtonActive]}
        onPress={() => setSortBy(type)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={14}
          color={isActive ? "#FF6B9D" : "#fff"}
        />
        <Text
          style={[styles.sortButtonText, isActive && styles.sortButtonTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (watchlist.length === 0) {
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
                    My Watchlist
                  </Animated.Text>
                  <Animated.Text 
                    style={[
                      styles.headerSubtitle,
                      { opacity: headerSubtitleOpacity }
                    ]}
                  >
                    No movies saved yet
                  </Animated.Text>
                </View>
                <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>0</Text>
                  </View>
                </Animated.View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: HEADER_MAX_HEIGHT + 20 }
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-15deg", "0deg"],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="bookmark-outline" size={70} color="#FF6B9D" />
              </Animated.View>
            </View>
            <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Start building your collection of must-watch movies!
            </Text>
            <Text style={styles.emptyHint}>
              💡 Tip: Swipe left on items to delete them later
            </Text>
            <TouchableOpacity style={styles.exploreButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["#FF6B9D", "#FEC163"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreGradient}
              >
                <Ionicons name="compass-outline" size={22} color="#fff" />
                <Text style={styles.exploreButtonText}>Discover Movies</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.ScrollView>
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
                  My Watchlist
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.headerSubtitle,
                    { opacity: headerSubtitleOpacity }
                  ]}
                >
                  {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} saved
                </Animated.Text>
              </View>
              <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{watchlist.length}</Text>
                </View>
              </Animated.View>
            </View>

            <Animated.View 
              style={[
                styles.sortContainer,
                { opacity: sortContainerOpacity }
              ]}
            >
              {renderSortButton("recent", "time-outline", "Recent")}
              {renderSortButton("rating", "star", "Rating")}
              {renderSortButton("title", "text", "A-Z")}
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: HEADER_MAX_HEIGHT + 25 }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.hintContainer}>
            <Ionicons name="arrow-back" size={14} color="#999" />
            <Text style={styles.swipeHint}>
              Swipe left to delete or tap ✕ button
            </Text>
          </View>
          {sortedWatchlist.map((movie, index) => (
            <AnimatedWatchlistItem
              key={movie.id}
              movie={movie}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </Animated.View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
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
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginTop: 6,
  },
  headerBadge: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  headerBadgeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    gap: 10,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  sortButtonTextActive: {
    color: "#FF6B9D",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 120,
  },
  listContent: {
    paddingTop: 25,
    paddingBottom: 100,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  swipeHint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 107, 157, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 3,
    borderColor: "rgba(255, 107, 157, 0.15)",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  emptyHint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 35,
    fontStyle: "italic",
  },
  exploreButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  exploreGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 45,
    alignItems: "center",
    gap: 10,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    marginBottom: 18,
    marginHorizontal: 15,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    overflow: "hidden",
  },
  deleteGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  itemContent: {
    flex: 1,
  },
  movieCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  posterContainer: {
    width: 110,
    height: "100%",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
  },
  movieInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  ratingText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 12,
  },
  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  yearText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  overview: {
    fontSize: 12,
    color: "#666",
    lineHeight: 17,
    flex: 1,
  },
  bottomInfo: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  genreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  genreText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
  },
  popularityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE4EC",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  popularityText: {
    fontSize: 10,
    color: "#FF6B9D",
    fontWeight: "600",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 17,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default WatchlistScreen;