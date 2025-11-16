import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

const TabBarButton = ({ children, onPress, accessibilityState }: any) => {
  const focused = accessibilityState?.selected;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.spring(translateYAnim, {
          toValue: -10,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    }
  }, [focused]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabIconContainer,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        {focused && (
          <LinearGradient
            colors={['rgba(255, 107, 157, 0.3)', 'rgba(254, 193, 99, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.focusedBg}
          />
        )}
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const TabScreen = () => {
  const pathname = usePathname();
  
  const isMovieDetailsScreen = pathname?.includes('/movies/') && pathname !== '/movies';
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FF6B9D",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: isMovieDetailsScreen ? { display: 'none' } : {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.7)',
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          borderWidth: Platform.OS === 'ios' ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: "#FF6B9D",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={80}
                tint="light"
                style={styles.blurView}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.4)',
                    'rgba(255, 255, 255, 0.3)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientOverlay}
                />
              </BlurView>
            ) : (
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.95)',
                  'rgba(255, 255, 255, 0.9)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.androidBackground}
              />
            )}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255, 255, 255, 0.2)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmer}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="movies"
        options={{
          title: "Movies",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "film" : "film-outline"}
                size={28}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "bookmark" : "bookmark-outline"}
                size={28}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={28}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  focusedBg: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B9D",
    marginTop: 4,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    borderRadius: 25,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  androidBackground: {
    flex: 1,
    borderRadius: 25,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    width: '200%',
  },
});

export default TabScreen;