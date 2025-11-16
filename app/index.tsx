import { useAppSelector } from "@/redux/hooks";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isFocused = useIsFocused();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(() => {
    if (isFocused) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)/movies");
        } else {
          router.replace("/login");
        }
      }, 2000); 

      return () => clearTimeout(timer);
    }
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF9A9E", "#FAD0C4", "#FFDDE1"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.circleContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={[styles.circle, styles.circle4]} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#FF6B9D", "#FEC163"]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>🎬</Text>
            </LinearGradient>
          </View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.appName}>MovieHub</Text>
            <Text style={styles.tagline}>Your Movie Community</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </Animated.View>
        </Animated.View>

        <View style={styles.bottomWave}>
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.1)"]}
            style={styles.waveGradient}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 100,
    right: -30,
  },
  circle3: {
    width: 250,
    height: 250,
    bottom: -100,
    left: 50,
  },
  circle4: {
    width: 180,
    height: 180,
    bottom: 100,
    right: -60,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  loadingContainer: {
    marginTop: 20,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  bottomWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  waveGradient: {
    flex: 1,
  },
});