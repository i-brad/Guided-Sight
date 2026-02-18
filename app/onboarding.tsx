import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { DotIndicator } from "@/components/DotIndicator";

const steps = [
  {
    icon: "bar" as const,
    title: "Focus Tunnel",
    description:
      "Guided Sight silences the noise, leaving only the line you\u2019re reading in focus.",
    button: "Continue",
  },
  {
    icon: "rect" as const,
    title: "Adjustable Depth",
    description:
      "Control how much text you see. Narrow for speed, wide for context.",
    button: "Next",
  },
  {
    icon: "book" as const,
    title: "Your Library",
    description:
      "Upload PDFs, paste web links, or choose from our classic collection.",
    button: "Start Reading",
  },
];

function StepIcon({ type }: { type: "bar" | "rect" | "book" }) {
  return (
    <View style={iconStyles.circle}>
      {type === "bar" && <View style={iconStyles.bar} />}
      {type === "rect" && <View style={iconStyles.rect} />}
      {type === "book" && (
        <Ionicons name="book-outline" size={28} color="#ffffff" />
      )}
    </View>
  );
}

const iconStyles = StyleSheet.create({
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bar: {
    width: 32,
    height: 8,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  rect: {
    width: 32,
    height: 16,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 3,
  },
});

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { setOnboardingComplete } = useTheme();

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOnboardingComplete(true);
      router.replace("/library");
    }
  };

  const current = steps[step];

  return (
    <View style={styles.container}>
      <Animated.View
        key={step}
        entering={FadeIn.duration(400)}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <StepIcon type={current.icon} />
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>

        <DotIndicator total={steps.length} active={step} />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>{current.button}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    maxWidth: 320,
    width: "100%",
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    width: "100%",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontWeight: "500",
    fontSize: 16,
  },
});
