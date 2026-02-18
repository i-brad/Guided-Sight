import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const router = useRouter();
  const { settings, isLoaded, colors } = useTheme();

  useEffect(() => {
    if (!isLoaded) return;
    if (settings.onboardingComplete) {
      router.replace("/library");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoaded, router, settings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
