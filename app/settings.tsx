import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
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

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: 'zen', label: 'Zen' },
  { name: 'paper', label: 'Paper' },
  { name: 'midnight', label: 'Midnight' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, colors, setTheme, setOverlayOpacity, setFocusHeight } =
    useTheme();
  const { todaySeconds } = useReadingStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Settings" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
        <Text style={styles.subtitle}>Customize your reading experience</Text>

        {/* Theme Selector */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <Text style={styles.groupLabel}>Reading Theme</Text>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.name}
                style={[
                  styles.themeBtn,
                  {
                    borderColor:
                      settings.theme === opt.name
                        ? colors.text
                        : 'rgba(128,128,128,0.2)',
                    backgroundColor:
                      settings.theme === opt.name
                        ? 'rgba(128,128,128,0.1)'
                        : 'transparent',
                  },
                ]}
                onPress={() => setTheme(opt.name)}
              >
                <Text
                  style={[
                    styles.themeBtnText,
                    {
                      color: colors.text,
                      fontWeight: settings.theme === opt.name ? '600' : '400',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Opacity Slider */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupLabel}>Ambient Opacity</Text>
            <Text style={[styles.valueLabel, { color: colors.text }]}>
              {settings.overlayOpacity}%
            </Text>
          </View>
          <Slider
            minimumValue={50}
            maximumValue={100}
            step={1}
            value={settings.overlayOpacity}
            onValueChange={setOverlayOpacity}
            minimumTrackTintColor="rgba(128,128,128,0.3)"
            maximumTrackTintColor="rgba(128,128,128,0.2)"
            thumbTintColor={colors.text}
          />
          <Text style={styles.hint}>
            Controls visibility of non-highlighted text.
          </Text>
        </View>

        {/* Focus Height Slider */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupLabel}>Default Focus Height</Text>
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
            minimumTrackTintColor="rgba(128,128,128,0.3)"
            maximumTrackTintColor="rgba(128,128,128,0.2)"
            thumbTintColor={colors.text}
          />
          <Text style={styles.hint}>
            The starting height of the focus tunnel.
          </Text>
        </View>

        {/* Reading Reminder */}
        <Pressable
          style={({ pressed }) => [
            styles.group,
            {
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.push('/reminder')}
        >
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupLabel}>Reading Reminder</Text>
              <Text style={[styles.reminderStatus, { color: colors.text }]}>
                {settings.reminder.enabled
                  ? `Daily at ${formatTime(settings.reminder.hour, settings.reminder.minute)}`
                  : 'Off'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(128,128,128,0.4)"
            />
          </View>
        </Pressable>

        {/* Reading Analytics */}
        <Pressable
          style={({ pressed }) => [
            styles.group,
            {
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.push('/analytics')}
        >
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupLabel}>Reading Analytics</Text>
              <Text style={[styles.reminderStatus, { color: colors.text }]}>
                {todaySeconds > 0
                  ? `${todaySeconds < 60 ? `${todaySeconds}s` : `${Math.floor(todaySeconds / 60)}m`} today`
                  : 'No reading today'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(128,128,128,0.4)"
            />
          </View>
        </Pressable>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.saveBtnText}>Save</Text>
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
    color: 'rgba(128,128,128,0.4)',
    marginBottom: 32,
  },
  group: {
    backgroundColor: 'rgba(128,128,128,0.05)',
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
    color: 'rgba(128,128,128,0.3)',
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  hint: {
    fontSize: 10,
    color: 'rgba(128,128,128,0.2)',
    marginTop: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  themeBtnText: {
    fontSize: 11,
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
});
