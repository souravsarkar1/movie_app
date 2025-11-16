import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Rect, Text as SvgText } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Genre ID to name mapping (TMDB genre IDs)
const GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface GenreData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const CHART_COLORS = [
  "#FF6B9D",
  "#FEC163",
  "#4ECDC4",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
  "#A8D8EA",
];

type ChartType = 'bar' | 'pie';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { watchlist } = useAppSelector((state) => state.movies);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Calculate genre preferences from watchlist
  const genreData = useMemo(() => {
    if (watchlist.length === 0) return [];

    const genreCounts: { [key: string]: number } = {};
    let totalGenres = 0;

    // Count genres from all movies in watchlist
    watchlist.forEach((movie) => {
      if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
        movie.genre_ids.forEach((genreId: number) => {
          const genreName = GENRE_MAP[genreId] || "Other";
          genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
          totalGenres++;
        });
      }
    });

    // Find max count for scaling
    const maxCount = Math.max(...Object.values(genreCounts));

    // Convert to array and calculate percentages
    const data: GenreData[] = Object.entries(genreCounts)
      .map(([name, count], index) => ({
        name,
        count,
        percentage: chartType === 'pie' 
          ? (count / totalGenres) * 100  // Percentage of total for pie
          : (count / maxCount) * 100,     // Scale to max for bar
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, chartType === 'pie' ? 6 : 8); // Top 6 for pie, 8 for bar

    return data;
  }, [watchlist, chartType]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [100, 50],
    extrapolate: 'clamp',
  });

  const userNameSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [24, 18],
    extrapolate: 'clamp',
  });

  const userEmailOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const renderBarChart = () => {
    if (genreData.length === 0) {
      return renderEmptyState();
    }

    const chartWidth = SCREEN_WIDTH - 80;
    const barHeight = 30;
    const barSpacing = 15;
    const chartHeight = genreData.length * (barHeight + barSpacing);
    const labelWidth = 90;
    const barChartWidth = chartWidth - labelWidth;

    return (
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {genreData.map((genre, index) => {
            const yPosition = index * (barHeight + barSpacing);
            const barWidth = (genre.percentage / 100) * barChartWidth;

            return (
              <React.Fragment key={index}>
                <SvgText
                  x={0}
                  y={yPosition + barHeight / 2 + 5}
                  fontSize="12"
                  fontWeight="600"
                  fill="#333"
                >
                  {genre.name}
                </SvgText>

                <Rect
                  x={labelWidth}
                  y={yPosition}
                  width={barWidth}
                  height={barHeight}
                  fill={genre.color}
                  rx={15}
                  ry={15}
                />

                <SvgText
                  x={labelWidth + barWidth + 8}
                  y={yPosition + barHeight / 2 + 5}
                  fontSize="12"
                  fontWeight="bold"
                  fill={genre.color}
                >
                  {genre.count}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

  const renderPieChart = () => {
    if (genreData.length === 0) {
      return renderEmptyState();
    }

    const size = SCREEN_WIDTH - 80;
    const radius = size / 3;
    const centerX = size / 2;
    const centerY = size / 2;
    
    let currentAngle = -90; 

    return (
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G>
            {genreData.map((genre, index) => {
              const angle = (genre.percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              // Calculate arc parameters
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = centerX + radius * Math.cos(startRad);
              const y1 = centerY + radius * Math.sin(startRad);
              const x2 = centerX + radius * Math.cos(endRad);
              const y2 = centerY + radius * Math.sin(endRad);
              
              const largeArcFlag = angle > 180 ? 1 : 0;

              currentAngle = endAngle;

              const midAngle = startAngle + angle / 2;
              const midRad = (midAngle * Math.PI) / 180;
              
              return (
                <G key={index}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="transparent"
                    stroke={genre.color}
                    strokeWidth={radius}
                    strokeDasharray={`${(angle / 360) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
                    strokeDashoffset={-((startAngle / 360) * (2 * Math.PI * radius))}
                    rotation={0}
                    origin={`${centerX}, ${centerY}`}
                  />
                </G>
              );
            })}
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.5}
              fill="#f8f9fa"
            />
            
            <SvgText
              x={centerX}
              y={centerY - 10}
              fontSize="24"
              fontWeight="bold"
              fill="#333"
              textAnchor="middle"
            >
              {watchlist.length}
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 15}
              fontSize="12"
              fill="#999"
              textAnchor="middle"
            >
              Movies
            </SvgText>
          </G>
        </Svg>

        <View style={styles.legendContainer}>
          {genreData.map((genre, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: genre.color }]} />
              <Text style={styles.legendText}>
                {genre.name}
              </Text>
              <Text style={styles.legendCount}>
                {genre.count} ({genre.percentage.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyChartContainer}>
        <Ionicons name="film-outline" size={48} color="#ccc" />
        <Text style={styles.emptyChartText}>
          Add movies to your watchlist to see your genre preferences
        </Text>
      </View>
    );
  };

  const renderChartToggle = () => {
    return (
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            chartType === 'bar' && styles.toggleButtonActive
          ]}
          onPress={() => setChartType('bar')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="bar-chart" 
            size={20} 
            color={chartType === 'bar' ? '#fff' : '#FF6B9D'} 
          />
          <Text style={[
            styles.toggleButtonText,
            chartType === 'bar' && styles.toggleButtonTextActive
          ]}>
            Bar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            chartType === 'pie' && styles.toggleButtonActive
          ]}
          onPress={() => setChartType('pie')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="pie-chart" 
            size={20} 
            color={chartType === 'pie' ? '#fff' : '#FF6B9D'} 
          />
          <Text style={[
            styles.toggleButtonText,
            chartType === 'pie' && styles.toggleButtonTextActive
          ]}>
            Pie
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
              <Animated.View
                style={[
                  styles.avatarContainer,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Animated.View 
                  style={[
                    styles.avatar,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: scrollY.interpolate({
                        inputRange: [0, HEADER_SCROLL_DISTANCE],
                        outputRange: [50, 25],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]}
                >
                  <Animated.Text 
                    style={[
                      styles.avatarText,
                      {
                        fontSize: scrollY.interpolate({
                          inputRange: [0, HEADER_SCROLL_DISTANCE],
                          outputRange: [40, 20],
                          extrapolate: 'clamp',
                        }),
                      }
                    ]}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Animated.Text>
                </Animated.View>
                <Animated.View 
                  style={[
                    styles.avatarBadge,
                    {
                      transform: [{ scale: avatarScale }],
                    }
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </Animated.View>
              </Animated.View>
              <Animated.Text 
                style={[
                  styles.userName,
                  { fontSize: userNameSize }
                ]}
              >
                {user?.name}
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.userEmail,
                  { opacity: userEmailOpacity }
                ]}
              >
                {user?.email}
              </Animated.Text>
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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{watchlist.length}</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Genre Preferences Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderLeft}>
              <Ionicons 
                name={chartType === 'bar' ? "bar-chart" : "pie-chart"} 
                size={24} 
                color="#FF6B9D" 
              />
              <Text style={styles.chartTitle}>Genre Preferences</Text>
            </View>
            {renderChartToggle()}
          </View>
          {chartType === 'bar' ? renderBarChart() : renderPieChart()}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF6B9D", "#FEC163"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarText: {
    fontWeight: "bold",
    color: "#fff",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollContent: {
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B9D",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  chartContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chartHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#FF6B9D",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B9D",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  chartWrapper: {
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  legendContainer: {
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  legendCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    gap: 10,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ProfileScreen;