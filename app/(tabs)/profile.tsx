import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { watchlist } = useAppSelector((state) => state.movies);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const scrollY = React.useRef(new Animated.Value(0)).current;

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

  const menuItems = [
    { icon: "person-outline", title: "Edit Profile", subtitle: "Update your details" },
    { icon: "notifications-outline", title: "Notifications", subtitle: "Manage alerts" },
    { icon: "settings-outline", title: "Settings", subtitle: "App preferences" },
    { icon: "help-circle-outline", title: "Help & Support", subtitle: "Get assistance" },
  ];

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

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color="#FF6B9D" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
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
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#999",
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