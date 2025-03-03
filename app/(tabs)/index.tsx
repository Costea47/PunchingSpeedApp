import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, StyleSheet, Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

const MIKE_TYSON_PUNCH_SPEED = 5.12; // Mike Tyson's punch speed in m/s (adjust as needed)

export default function HomeScreen() {
  // Track current acceleration (not used in display here)
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  // Whether we are currently tracking accelerometer data
  const [isTracking, setIsTracking] = useState(false);
  // The maximum "speed" measured during the tracking session
  const [maxSpeed, setMaxSpeed] = useState(0);
  // The message to display after tracking
  const [resultMessage, setResultMessage] = useState("");
  // Instruction text to show during the tracking session
  const [instructionText, setInstructionText] = useState(
    "Hold your phone and get ready to punch the air!"
  );

  // Use ReturnType to infer the subscription type from Accelerometer.addListener
  const subscription = useRef<ReturnType<
    typeof Accelerometer.addListener
  > | null>(null);

  const startTracking = () => {
    if (Platform.OS === "web") {
      alert("Accelerometer is not available on web.");
      return;
    }
    // Reset the max speed when starting a new measurement
    setMaxSpeed(0);
    setResultMessage("");
    setInstructionText("Punch now and hold the phone steady!");
    setIsTracking(true);

    // Start listening to accelerometer data
    subscription.current = Accelerometer.addListener((data) => {
      setAcceleration(data);
      // Calculate the magnitude of the acceleration vector
      const currentSpeed = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      // Update maxSpeed if the current value is higher
      setMaxSpeed((prevMax) => Math.max(prevMax, currentSpeed));
    });
    Accelerometer.setUpdateInterval(100); // Update interval: 100ms

    // After 3 seconds, stop tracking and show the result
    setTimeout(() => {
      stopTracking();
    }, 3000); // Adjust time to 3 seconds for better punch time
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }

    // Calculate how close the user is to Mike Tyson's punch speed
    const difference = Math.abs(MIKE_TYSON_PUNCH_SPEED - maxSpeed);
    const percentageClose = Math.max(
      0,
      (1 - difference / MIKE_TYSON_PUNCH_SPEED) * 100
    ).toFixed(0);

    // Display a message with the punch speed and a funny comment
    setResultMessage(
      `Your max punch speed: ${maxSpeed.toFixed(2)} m/s\n` +
        `You're ${percentageClose}% as fast as Mike Tyson! 🥊💨`
    );
    setInstructionText("Tracking complete! Check your results!");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{instructionText}</Text>
      <Text style={styles.text}>
        {resultMessage || `Max Punch Speed: ${maxSpeed.toFixed(2)} m/s`}
      </Text>
      <Button
        title={isTracking ? "Stop" : "Start"}
        onPress={isTracking ? stopTracking : startTracking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },
});
