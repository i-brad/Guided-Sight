import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useReadingStats } from '@/context/ReadingStatsContext';
import { HeaderBar } from '@/components/HeaderBar';
import { ThemeName } from '@/types';

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

const themeOptions: { name: ThemeName; label: string; swatch: string }[] = [
  { name: 'zen', label: 'Zen', swatch: '#121212' },
  { name: 'paper', label: 'Paper', swatch: '#f5f5f0' },
  { name: 'midnight', label: 'Midnight', swatch: '#000000' },
  { name: 'slate', label: 'Slate', swatch: '#2b2d30' },
  { name: 'crimson', label: 'Crimson', swatch: '#1a0a0a' },
  { name: 'ocean', label: 'Ocean', swatch: '#0a1520' },
  { name: 'forest', label: 'Forest', swatch: '#0a140a' },
  { name: 'amber', label: 'Amber', swatch: '#181208' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, colors, setTheme, setOverlayOpacity, setFocusHeight, setOpenaiApiKey } =
    useTheme();
  const [keyVisible, setKeyVisible] = useState(false);
  const { todaySeconds } = useReadingStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Settings" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>Customize your reading experience</Text>

        {/* Theme Selector */}
        <View style={[styles.group, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.groupLabel, { color: colors.mutedText }]}>Reading Theme</Text>
          <View style={styles.themeGrid}>
            {themeOptions.map((opt) => {
              const isActive = settings.theme === opt.name;
              return (
                <Pressable
                  key={opt.name}
                  style={[
                    styles.themeBtn,
                    {
                      borderColor: isActive
                        ? colors.text
                        : colors.cardBorder,
                      backgroundColor: isActive
                        ? colors.cardBackground
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setTheme(opt.name)}
                >
                  <View
                    style={[
                      styles.themeSwatch,
                      {
                        backgroundColor: opt.swatch,
                        borderColor: isActive
                          ? colors.text
                          : colors.cardBorder,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: colors.text,
                        fontWeight: isActive ? '600' : '400',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Text Visibility Slider */}
        <View style={[styles.group, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}>
          <View style={styles.groupHeader}>
            <Text style={[styles.groupLabel, { color: colors.mutedText }]}>Text Visibility</Text>
            <Text style={[styles.valueLabel, { color: colors.text }]}>
              {100 - settings.overlayOpacity}%
            </Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={50}
            step={1}
            value={100 - settings.overlayOpacity}
            onValueChange={(val) => setOverlayOpacity(100 - val)}
            minimumTrackTintColor={colors.mutedText}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.text}
          />
          <Text style={[styles.hint, { color: colors.mutedText }]}>
            Higher values make non-highlighted text more visible.
          </Text>
        </View>

        {/* Focus Height Slider */}
        <View style={[styles.group, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}>
          <View style={styles.groupHeader}>
            <Text style={[styles.groupLabel, { color: colors.mutedText }]}>Default Focus Height</Text>
            <Text style={[styles.valueLabel, { color: colors.text }]}>
              {settings.focusHeight}px
            </Text>
          </View>
          <Slider
            minimumValue={40}
            maximumValue={220}
            step={1}
            value={settings.focusHeight}
            onValueChange={setFocusHeight}
            minimumTrackTintColor={colors.mutedText}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.text}
          />
          <Text style={[styles.hint, { color: colors.mutedText }]}>
            The starting height of the focus tunnel.
          </Text>
        </View>

        {/* Reading Reminder */}
        <Pressable
          style={({ pressed }) => [
            styles.group,
            {
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBackground,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.push('/reminder')}
        >
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.groupLabel, { color: colors.mutedText }]}>Reading Reminder</Text>
              <Text style={[styles.reminderStatus, { color: colors.text }]}>
                {settings.reminder.enabled
                  ? `Daily at ${formatTime(settings.reminder.hour, settings.reminder.minute)}`
                  : 'Off'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.mutedText}
            />
          </View>
        </Pressable>

        {/* Reading Analytics */}
        <Pressable
          style={({ pressed }) => [
            styles.group,
            {
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBackground,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.push('/analytics')}
        >
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.groupLabel, { color: colors.mutedText }]}>Reading Analytics</Text>
              <Text style={[styles.reminderStatus, { color: colors.text }]}>
                {todaySeconds > 0
                  ? `${todaySeconds < 60 ? `${todaySeconds}s` : `${Math.floor(todaySeconds / 60)}m`} today`
                  : 'No reading today'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.mutedText}
            />
          </View>
        </Pressable>

        {/* OpenAI API Key */}
        <View style={[styles.group, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.groupLabel, { color: colors.mutedText }]}>OpenAI API Key</Text>
          <Text style={[styles.hint, { color: colors.mutedText }]}>Required for PDF and URL text extraction</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <TextInput
              style={[styles.apiKeyInput, { color: colors.text, borderBottomColor: colors.cardBorder, flex: 1 }]}
              placeholder="sk-..."
              placeholderTextColor={colors.mutedText}
              value={settings.openaiApiKey}
              onChangeText={(text) => setOpenaiApiKey(text.trim())}
              secureTextEntry={!keyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setKeyVisible(!keyVisible)}>
              <Ionicons
                name={keyVisible ? 'eye-off' : 'eye'}
                size={20}
                color={colors.mutedText}
                style={{ marginLeft: 12 }}
              />
            </Pressable>
          </View>
          {settings.openaiApiKey ? (
            <Text style={[styles.hint, { color: 'rgba(90,180,90,0.6)', marginTop: 8 }]}>
              Key saved
            </Text>
          ) : null}
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.accent, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.saveBtnText, { color: colors.background }]}>Save</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 110,
    paddingHorizontal: 24,
    paddingBottom: 60,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 32,
  },
  group: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  hint: {
    fontSize: 10,
    marginTop: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeBtn: {
    width: '22%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  themeSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 14,
  },
  apiKeyInput: {
    fontSize: 14,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
});
