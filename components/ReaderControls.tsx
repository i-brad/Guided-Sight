import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useHighlights } from "@/context/HighlightsContext";
import { useState } from "react";

type Tab = "focus" | "fontSize" | "visibility" | "speech" | "highlights";

interface ReaderControlsProps {
  spotlightHeight: SharedValue<number>;
  initialHeight: number;
  documentId: number;
  isSpeaking: boolean;
  isPaused: boolean;
  speechRate: number;
  onPlay: () => void;
  onPause: () => void;
  onSpeechRateChange: (rate: number) => void;
  highlightMode: boolean;
  onToggleHighlightMode: () => void;
}

const tabs: { key: Tab; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "focus", icon: "scan-outline" },
  { key: "fontSize", icon: "text-outline" },
  { key: "visibility", icon: "eye-outline" },
  { key: "speech", icon: "volume-high-outline" },
  { key: "highlights", icon: "bookmark-outline" },
];

const SPEED_PRESETS = [0.5, 1, 1.5, 2] as const;

export function ReaderControls({
  spotlightHeight,
  initialHeight,
  documentId,
  isSpeaking,
  isPaused,
  speechRate,
  onPlay,
  onPause,
  onSpeechRateChange,
  highlightMode,
  onToggleHighlightMode,
}: ReaderControlsProps) {
  const { colors, settings, setFontSize, setOverlayOpacity } = useTheme();
  const { getHighlightsForDocument } = useHighlights();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [heightVal, setHeightVal] = useState(initialHeight);
  const [activeTab, setActiveTab] = useState<Tab>("focus");

  const docHighlights = getHighlightsForDocument(documentId);

  const handleHeightChange = (val: number) => {
    spotlightHeight.value = val;
    setHeightVal(val);
  };

  const handleFontSizeChange = (val: number) => {
    setFontSize(Math.round(val));
  };

  const handleVisibilityChange = (val: number) => {
    setOverlayOpacity(100 - Math.round(val));
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `rgba(${colors.overlayBase}, 0.8)`,
          borderTopColor: colors.cardBorder,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              hitSlop={8}
              style={[
                styles.tabBtn,
                isActive && { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? colors.text : colors.mutedText}
              />
            </Pressable>
          );
        })}
      </View>

      {activeTab === "focus" && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              Narrow Focus
            </Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              Wide Focus
            </Text>
          </View>
          <Slider
            minimumValue={40}
            maximumValue={220}
            value={heightVal}
            onValueChange={handleHeightChange}
            minimumTrackTintColor={colors.mutedText}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.text}
            style={styles.slider}
          />
        </View>
      )}

      {activeTab === "fontSize" && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              Smaller Text
            </Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              Larger Text
            </Text>
          </View>
          <Slider
            minimumValue={14}
            maximumValue={28}
            step={1}
            value={settings.fontSize}
            onValueChange={handleFontSizeChange}
            minimumTrackTintColor={colors.mutedText}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.text}
            style={styles.slider}
          />
        </View>
      )}

      {activeTab === "visibility" && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              Less Visible
            </Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>
              More Visible
            </Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={50}
            step={1}
            value={100 - settings.overlayOpacity}
            onValueChange={handleVisibilityChange}
            minimumTrackTintColor={colors.mutedText}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.text}
            style={styles.slider}
          />
        </View>
      )}

      {activeTab === "speech" && (
        <View style={styles.speechRow}>
          <Pressable
            onPress={isSpeaking && !isPaused ? onPause : onPlay}
            style={[styles.speechBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons
              name={isSpeaking && !isPaused ? "pause" : "play"}
              size={20}
              color={colors.background}
            />
          </Pressable>
          <View style={styles.speedChips}>
            {SPEED_PRESETS.map((preset) => {
              const isActive = speechRate === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => onSpeechRateChange(preset)}
                  hitSlop={4}
                  style={[
                    styles.speedChip,
                    {
                      backgroundColor: isActive
                        ? colors.accent
                        : colors.cardBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.speedChipText,
                      {
                        color: isActive ? colors.background : colors.mutedText,
                      },
                    ]}
                  >
                    {preset}x
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {activeTab === "highlights" && (
        <View style={styles.highlightsWrapper}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Highlighter
            </Text>
            <Switch
              value={highlightMode}
              onValueChange={onToggleHighlightMode}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor="#fff"
              style={{ transform: [{ scale: 0.65 }] }}
            />
          </View>
          <Pressable
            onPress={() => router.push("/highlights")}
            style={styles.viewAllRow}
          >
            <Text style={[styles.viewAllLabel, { color: colors.mutedText }]}>
              {docHighlights.length}{" "}
              {docHighlights.length === 1 ? "highlight" : "highlights"} saved
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.mutedText}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 1200,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  tabBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderWrapper: {
    gap: 6,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slider: {
    width: "100%",
    height: 20,
  },
  speechRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  speedChips: {
    flexDirection: "row",
    gap: 8,
  },
  speedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  speedChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  speechBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightsWrapper: {
    gap: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAllLabel: {
    fontSize: 13,
  },
});
