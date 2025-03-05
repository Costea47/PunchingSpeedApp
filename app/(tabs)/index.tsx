import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const MIKE_TYSON_PUNCH_SPEED = 15.12;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [resultMessage, setResultMessage] = useState("");
  const [instructionText, setInstructionText] = useState(
    "Hold your phone and get ready to punch!"
  );

  const subscription = useRef(null);
  const progressValue = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(progressValue.value * SCREEN_WIDTH * 0.8, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const startTracking = () => {
    if (Platform.OS === "web") {
      alert("Accelerometer is not available on web.");
      return;
    }

    setMaxSpeed(0);
    setResultMessage("");
    setInstructionText("🥊 PUNCH NOW! 🥊");
    setIsTracking(true);

    subscription.current = Accelerometer.addListener((data) => {
      const currentSpeed = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      setMaxSpeed((prevMax) => {
        const newMax = Math.max(prevMax, currentSpeed);
        progressValue.value = Math.min(newMax / MIKE_TYSON_PUNCH_SPEED, 1);
        return newMax;
      });
    });

    Accelerometer.setUpdateInterval(16);

    setTimeout(() => {
      stopTracking();
    }, 3000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }

    const percentageOfTyson = (
      (maxSpeed / MIKE_TYSON_PUNCH_SPEED) *
      100
    ).toFixed(0);
    let message = "";

    if (percentageOfTyson > 90) {
      message = "🏆 Iron Mike would be proud!";
    } else if (percentageOfTyson > 70) {
      message = "💪 Future champion material!";
    } else if (percentageOfTyson > 50) {
      message = "👊 Keep training, warrior!";
    } else {
      message = "🥊 Everyone starts somewhere!";
    }

    setResultMessage(
      `${message}\nYour punch: ${maxSpeed.toFixed(
        1
      )} m/s\n${percentageOfTyson}% of Tyson's best!`
    );
    setInstructionText("Ready for another round?");
  };

  useEffect(() => {
    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);

  return (
    <LinearGradient colors={["#D9DDDC", "#C0C5C3"]} style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        onError={() => console.log("Error loading logo")}
      />

      <View style={styles.speedometer}>
        <Text style={styles.speedText}>
          {maxSpeed.toFixed(1)}
          <Text style={styles.unit}> m/s</Text>
        </Text>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      <Text style={styles.instruction}>{instructionText}</Text>
      {resultMessage ? (
        <Text style={styles.result}>{resultMessage}</Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={startTracking}
          disabled={isTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? "Tracking..." : "Start"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  logo: { width: SCREEN_WIDTH * 0.8, height: 200, marginBottom: 0 },
  speedometer: { alignItems: "center", marginBottom: 40 },
  speedText: { fontSize: 72, color: "#363636", marginBottom: 20 },
  unit: { fontSize: 24, color: "#888" },
  progressBackground: {
    width: SCREEN_WIDTH * 0.5,
    height: 12,
    backgroundColor: "#333",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#ff3e3e", borderRadius: 6 },
  instruction: {
    fontSize: 20,
    color: "#222021",
    textAlign: "center",
    marginBottom: 20,
  },
  result: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#ff3e3e",
    padding: 15,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
