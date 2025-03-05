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
import { Accelerometer } from "expo-sensors"; // Import Accelerometer to measure phone movement
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated"; // Import Reanimated for animations
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient for the background

// These are just constants. Mike Tyson's punch speed and the screen width.
const MIKE_TYSON_PUNCH_SPEED = 15.12;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  // These are the state variables that hold information about the punch tracking
  const [isTracking, setIsTracking] = useState(false); // Is tracking active or not?
  const [maxSpeed, setMaxSpeed] = useState(0); // The highest punch speed recorded
  const [resultMessage, setResultMessage] = useState(""); // Message that shows the result after punch
  const [instructionText, setInstructionText] = useState(
    "Hold your phone and get ready to punch!" // Initial message that tells the user what to do
  );

  // This is a reference to manage the accelerometer updates
  const subscription = useRef<any>(null);
  const progressValue = useSharedValue(0); // Shared value for the progress bar animation

  // Animated style for the progress bar
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(progressValue.value * SCREEN_WIDTH * 0.8, {
        damping: 15, // Smooth animation
        stiffness: 100, // Bouncy animation
      }),
    };
  });

  // This function starts tracking the punch when the user is ready
  const startTracking = () => {
    // If the platform is web, we show an alert because the accelerometer doesn't work on the web
    if (Platform.OS === "web") {
      alert("Accelerometer is not available on web.");
      return;
    }

    // Reset previous data and update the instruction text
    setMaxSpeed(0);
    setResultMessage("");
    setInstructionText("🥊 PUNCH NOW! 🥊");
    setIsTracking(true); // Mark that tracking is now active

    // Start listening to the accelerometer data
    subscription.current = Accelerometer.addListener((data) => {
      const currentSpeed = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2); // Calculate speed

      // Only update the speed if it's greater than a small value to avoid noise
      if (currentSpeed > 0.1) {
        setMaxSpeed((prevMax) => {
          const newMax = Math.max(prevMax, currentSpeed); // Save the highest speed
          progressValue.value = Math.min(newMax / MIKE_TYSON_PUNCH_SPEED, 1); // Update the progress bar
          return newMax;
        });
      }
    });

    // Set how often we get updates from the accelerometer (every 16 milliseconds)
    Accelerometer.setUpdateInterval(16);

    // Stop tracking after 3 seconds
    setTimeout(() => {
      stopTracking();
    }, 3000);
  };

  // This function stops tracking and shows the result
  const stopTracking = () => {
    setIsTracking(false); // Stop tracking

    // Remove the accelerometer listener
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }

    // Calculate the percentage of Tyson's punch speed
    const percentageOfTyson = (maxSpeed / MIKE_TYSON_PUNCH_SPEED) * 100;
    let message = "";

    // Show different messages based on how fast the punch was
    if (percentageOfTyson > 90) {
      message = "🏆 Iron Mike would be proud!";
    } else if (percentageOfTyson > 70) {
      message = "💪 Future champion material!";
    } else if (percentageOfTyson > 50) {
      message = "👊 Keep training, warrior!";
    } else {
      message = "🥊 Everyone starts somewhere!";
    }

    // Show the result with the punch speed and percentage
    setResultMessage(
      `${message}\nYour punch: ${maxSpeed.toFixed(
        1
      )} m/s\n${percentageOfTyson.toFixed(0)}% of Tyson's best!`
    );
    setInstructionText("Ready for another round?");
  };

  // This effect cleans up the listener when the component is removed (unmounted)
  useEffect(() => {
    return () => {
      if (subscription.current) {
        subscription.current.remove(); // Remove the listener when we no longer need it
      }
    };
  }, []);

  return (
    // A nice gradient background
    <LinearGradient colors={["#D9DDDC", "#C0C5C3"]} style={styles.container}>
      {/* Display the logo image */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        onError={() => console.log("Error loading logo")} // Log an error if logo fails to load
      />

      {/* Display punch speed and progress bar */}
      <View style={styles.speedometer}>
        <Text style={styles.speedText}>
          {maxSpeed.toFixed(1)} {/* Display current punch speed */}
          <Text style={styles.unit}> m/s</Text> {/* Units for speed */}
        </Text>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, progressStyle]} />{" "}
          {/* Animated progress bar */}
        </View>
      </View>

      {/* Display instructions or result message */}
      <Text style={styles.instruction}>{instructionText}</Text>
      {resultMessage ? (
        <Text style={styles.result}>{resultMessage}</Text> // Display the result if there's one
      ) : null}

      {/* Button to start tracking the punch */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={startTracking} // Start tracking when button is pressed
          disabled={isTracking} // Disable button when tracking is already active
        >
          <Text style={styles.buttonText}>
            {isTracking ? "Tracking..." : "Start"}{" "}
            {/* Button text changes when tracking is active */}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Styles for the UI elements
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
