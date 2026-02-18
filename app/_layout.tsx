import { LibraryProvider } from "@/context/LibraryContext";
import { ImportProvider } from "@/context/ImportContext";
import { ReadingStatsProvider } from "@/context/ReadingStatsContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ImportBanner } from "@/components/ImportBanner";
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
          <ImportProvider>
            <ReadingStatsProvider>
              <StatusBarThemed />
              <ImportBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "ios_from_right",
                  animationDuration: 250,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="onboarding"
                  options={{
                    presentation: "fullScreenModal",
                    animation: "fade",
                  }}
                />
                <Stack.Screen name="library" />
                <Stack.Screen name="reader" />
                <Stack.Screen
                  name="import"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade_from_bottom",
                    animationDuration: 300,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade_from_bottom",
                    animationDuration: 300,
                  }}
                />
                <Stack.Screen
                  name="reminder"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade_from_bottom",
                    animationDuration: 300,
                  }}
                />
                <Stack.Screen
                  name="analytics"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade_from_bottom",
                    animationDuration: 300,
                  }}
                />
              </Stack>
            </ReadingStatsProvider>
          </ImportProvider>
        </LibraryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
