import { LibraryProvider } from "@/context/LibraryContext";
import { ReadingStatsProvider } from "@/context/ReadingStatsContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

function StatusBarThemed() {
  const { settings } = useTheme();
  return <StatusBar style={settings.theme === "paper" ? "dark" : "light"} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LibraryProvider>
          <ReadingStatsProvider>
            <StatusBarThemed />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen
                name="onboarding"
                options={{ presentation: "fullScreenModal", animation: "fade" }}
              />
              <Stack.Screen name="library" />
              <Stack.Screen name="reader" />
              <Stack.Screen
                name="import"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="settings"
                options={{ presentation: "modal", animation: "fade" }}
              />
              <Stack.Screen
                name="reminder"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="analytics"
                options={{ presentation: "modal", animation: "fade" }}
              />
            </Stack>
          </ReadingStatsProvider>
        </LibraryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
