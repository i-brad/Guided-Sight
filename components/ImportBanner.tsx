import { useCallback, useEffect, useRef } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useImport } from "@/context/ImportContext";

export function ImportBanner() {
  const { status, progressMessage, importedItemId, errorMessage, dismiss } =
    useImport();
  const { colors } = useTheme();
  const router = useRouter();
  const translateY = useRef(new Animated.Value(-100)).current;

  const visible = status !== "idle";

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 200,
      }).start();
    } else {
      translateY.setValue(-100);
    }
  }, [visible, translateY]);

  const slideOut = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => dismiss());
  }, [translateY, dismiss]);

  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => {
        slideOut();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, slideOut]);

  const handlePress = () => {
    if (status === "done" && importedItemId) {
      slideOut();
      router.push(`/reader?id=${importedItemId}`);
    }
    if (status === "error") {
      slideOut();
    }
  };

  if (!visible) return null;

  const isError = status === "error";
  const isDone = status === "done";

  let label = progressMessage;
  if (isDone) label = "Import complete! Tap to read";
  if (isError) label = errorMessage || "Import failed";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: isError
            ? "rgba(180,60,60,0.95)"
            : colors.cardBackground,
          borderColor: isError ? "rgba(200,80,80,0.5)" : colors.cardBorder,
        },
      ]}
    >
      <Pressable
        style={styles.inner}
        onPress={handlePress}
        disabled={status === "importing"}
      >
        {status === "importing" && (
          <ActivityIndicator
            size="small"
            color={colors.mutedText}
            style={styles.spinner}
          />
        )}
        <Text
          style={[
            styles.label,
            {
              color: isError ? "#fff" : isDone ? colors.text : colors.mutedText,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderRadius: 14,
    zIndex: 3000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  spinner: {
    marginRight: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
