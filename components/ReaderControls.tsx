import { View, Text, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

type Tab = 'focus' | 'fontSize' | 'visibility';

interface ReaderControlsProps {
  spotlightHeight: SharedValue<number>;
}

const tabs: { key: Tab; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'focus', icon: 'scan-outline' },
  { key: 'fontSize', icon: 'text-outline' },
  { key: 'visibility', icon: 'eye-outline' },
];

export function ReaderControls({ spotlightHeight }: ReaderControlsProps) {
  const { colors, settings, setFontSize, setOverlayOpacity } = useTheme();
  const insets = useSafeAreaInsets();
  const [heightVal, setHeightVal] = useState(spotlightHeight.value);
  const [activeTab, setActiveTab] = useState<Tab>('focus');

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

      {activeTab === 'focus' && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Narrow Focus</Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>Wide Focus</Text>
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

      {activeTab === 'fontSize' && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Smaller Text</Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>Larger Text</Text>
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

      {activeTab === 'visibility' && (
        <View style={styles.sliderWrapper}>
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Less Visible</Text>
            <Text style={[styles.label, { color: colors.mutedText }]}>More Visible</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tabBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderWrapper: {
    gap: 6,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slider: {
    width: '100%',
    height: 20,
  },
});
