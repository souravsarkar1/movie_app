import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../../../redux/slices/movieSlice";
import { fetchMovieDetails } from "../../../redux/slices/movieDetailsSlice";
import { AppDispatch, RootState } from "../../../redux/store";

const { width, height } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const SingleMovieScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { currentMovie, loading, error } = useSelector(
    (state: RootState) => state.movieDetails
  );
  const { watchlist } = useSelector((state: RootState) => state.movies);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetails(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentMovie) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentMovie]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const isInWatchlist = currentMovie
    ? watchlist.some((m) => m.id === currentMovie.id)
    : false;

  const handleToggleWatchlist = () => {
    if (!currentMovie) return;

    const movieData = {
      id: currentMovie.id,
      title: currentMovie.title,
      poster_path: currentMovie.poster_path,
      backdrop_path: currentMovie.backdrop_path,
      vote_average: currentMovie.vote_average,
      release_date: currentMovie.release_date,
      overview: currentMovie.overview,
      adult: currentMovie.adult,
      original_title: currentMovie.original_title,
      media_type: "movie",
      original_language: currentMovie.original_language,
      genre_ids: currentMovie.genres.map((g) => g.id),
      popularity: currentMovie.popularity,
      video: currentMovie.video,
      vote_count: currentMovie.vote_count,
    };

    if (isInWatchlist) {
      dispatch(removeFromWatchlist(currentMovie.id));
      Toast.show({
        type: "error",
        text1: "Removed",
        text2: `${currentMovie.title} removed from watchlist`,
      });
    } else {
      dispatch(addToWatchlist(movieData));
      Toast.show({
        type: "success",
        text1: "Added",
        text2: `${currentMovie.title} added to watchlist`,
      });
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  if (error || !currentMovie) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF6B9D" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>
          {error || "Failed to load movie details"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.header, { backgroundColor: `rgba(255, 107, 157, ${headerOpacity})` }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Animated.Text
              style={[styles.headerTitle, { opacity: headerOpacity }]}
              numberOfLines={1}
            >
              {currentMovie.title}
            </Animated.Text>
            <TouchableOpacity
              style={styles.watchlistHeaderButton}
              onPress={handleToggleWatchlist}
            >
              <Ionicons
                name={isInWatchlist ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.backdropContainer,
            {
              transform: [
                { scale: imageScale },
                { translateY: imageTranslateY },
              ],
            },
          ]}
        >
          <Image
            source={{
              uri: `${IMAGE_BASE_URL}${currentMovie.backdrop_path || currentMovie.poster_path}`,
            }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.backdropGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.mainInfo}>
            <View style={styles.posterContainer}>
              <Image
                source={{
                  uri: `${IMAGE_BASE_URL}${currentMovie.poster_path}`,
                }}
                style={styles.poster}
                resizeMode="cover"
              />
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>{currentMovie.title}</Text>
              {currentMovie.tagline ? (
                <Text style={styles.tagline}>"{currentMovie.tagline}"</Text>
              ) : null}

              <View style={styles.metaRow}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.rating}>
                    {currentMovie.vote_average.toFixed(1)}
                  </Text>
                  <Text style={styles.voteCount}>
                    ({currentMovie.vote_count.toLocaleString()})
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {new Date(currentMovie.release_date).getFullYear()}
                  </Text>
                </View>
                <View style={styles.infoBadge}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {formatRuntime(currentMovie.runtime)}
                  </Text>
                </View>
                <View style={styles.infoBadge}>
                  <Ionicons name="language-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {currentMovie.original_language.toUpperCase()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.watchlistButton,
                  isInWatchlist && styles.watchlistButtonActive,
                ]}
                onPress={handleToggleWatchlist}
              >
                <Ionicons
                  name={isInWatchlist ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={isInWatchlist ? "#fff" : "#FF6B9D"}
                />
                <Text
                  style={[
                    styles.watchlistButtonText,
                    isInWatchlist && styles.watchlistButtonTextActive,
                  ]}
                >
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {currentMovie.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genresContainer}>
                {currentMovie.genres.map((genre) => (
                  <View key={genre.id} style={styles.genreChip}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{currentMovie.overview}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Box Office</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Budget</Text>
                <Text style={styles.statValue}>
                  {currentMovie.budget > 0
                    ? formatCurrency(currentMovie.budget)
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>
                  {currentMovie.revenue > 0
                    ? formatCurrency(currentMovie.revenue)
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>{currentMovie.status}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Popularity</Text>
                <Text style={styles.statValue}>
                  {currentMovie.popularity.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {currentMovie.production_companies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Production Companies</Text>
              <View style={styles.companiesContainer}>
                {currentMovie.production_companies.map((company) => (
                  <View key={company.id} style={styles.companyCard}>
                    {company.logo_path ? (
                      <Image
                        source={{
                          uri: `${IMAGE_BASE_URL}${company.logo_path}`,
                        }}
                        style={styles.companyLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.companyPlaceholder}>
                        <Ionicons name="business-outline" size={24} color="#999" />
                      </View>
                    )}
                    <Text style={styles.companyName} numberOfLines={2}>
                      {company.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Original Title</Text>
                <Text style={styles.infoItemValue}>
                  {currentMovie.original_title}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Release Date</Text>
                <Text style={styles.infoItemValue}>
                  {new Date(currentMovie.release_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Text>
              </View>
              {currentMovie.homepage && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemLabel}>Homepage</Text>
                  <Text
                    style={[styles.infoItemValue, styles.link]}
                    numberOfLines={1}
                  >
                    {currentMovie.homepage}
                  </Text>
                </View>
              )}
              {currentMovie.imdb_id && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemLabel}>IMDB ID</Text>
                  <Text style={styles.infoItemValue}>
                    {currentMovie.imdb_id}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 15,
  },
  watchlistHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdropContainer: {
    width: width,
    height: height * 0.4,
    backgroundColor: "#000",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  backdropGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  content: {
    marginTop: -80,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  mainInfo: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  posterContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 15,
  },
  titleSection: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  voteCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  watchlistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF6B9D",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    gap: 8,
    marginTop: 5,
  },
  watchlistButtonActive: {
    backgroundColor: "#FF6B9D",
    borderColor: "#FF6B9D",
  },
  watchlistButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B9D",
  },
  watchlistButtonTextActive: {
    color: "#fff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreChip: {
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  overview: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  companiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  companyCard: {
    width: (width - 60) / 2,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  companyLogo: {
    width: 80,
    height: 50,
    marginBottom: 10,
  },
  companyPlaceholder: {
    width: 80,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  additionalInfo: {
    gap: 15,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  infoItemLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  infoItemValue: {
    fontSize: 15,
    color: "#333",
  },
  link: {
    color: "#FF6B9D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SingleMovieScreen;