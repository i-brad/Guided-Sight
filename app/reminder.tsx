import { useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/context/ThemeContext';
import { HeaderBar } from '@/components/HeaderBar';
import { Toast } from '@/components/Toast';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function ReminderScreen() {
  const router = useRouter();
  const { settings, colors, setReminder } = useTheme();
  const [enabled, setEnabled] = useState(settings.reminder.enabled);
  const [hour, setHour] = useState(settings.reminder.hour);
  const [minute, setMinute] = useState(settings.reminder.minute);
  const [toast, setToast] = useState('');

  const adjustHour = (delta: number) => {
    setHour((prev) => ((prev + delta + 24) % 24));
  };

  const adjustMinute = (delta: number) => {
    setMinute((prev) => {
      const next = prev + delta;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
  };

  const handleSave = async () => {
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setToast('Notification permission denied');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Read',
          body: 'Your focus tunnel is waiting. Open Guided Sight and read for a few minutes.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      setReminder({ enabled: true, hour, minute });
      setToast(`Reminder set for ${formatTime(hour, minute)}`);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setReminder({ enabled: false, hour, minute });
      setToast('Reminder turned off');
    }

    setTimeout(() => router.back(), 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Reading Reminder" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          Reading Reminder
        </Text>
        <Text style={styles.subtitle}>Build a daily reading habit</Text>

        {/* Enable Toggle */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Daily Reminder
            </Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{
                false: 'rgba(128,128,128,0.2)',
                true: 'rgba(128,128,128,0.4)',
              }}
              thumbColor={enabled ? colors.text : 'rgba(128,128,128,0.5)'}
            />
          </View>
        </View>

        {/* Time Picker */}
        {enabled && (
          <View style={[styles.group, { borderColor: colors.cardBorder }]}>
            <Text style={styles.groupLabel}>Reminder Time</Text>

            <View style={styles.pickerRow}>
              {/* Hour */}
              <View style={styles.pickerCol}>
                <Pressable
                  onPress={() => adjustHour(1)}
                  style={styles.arrowBtn}
                >
                  <Text style={[styles.arrow, { color: colors.text }]}>
                    {'\u25B2'}
                  </Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {String(hour % 12 || 12).padStart(2, '0')}
                </Text>
                <Pressable
                  onPress={() => adjustHour(-1)}
                  style={styles.arrowBtn}
                >
                  <Text style={[styles.arrow, { color: colors.text }]}>
                    {'\u25BC'}
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.pickerColon, { color: colors.text }]}>:</Text>

              {/* Minute */}
              <View style={styles.pickerCol}>
                <Pressable
                  onPress={() => adjustMinute(5)}
                  style={styles.arrowBtn}
                >
                  <Text style={[styles.arrow, { color: colors.text }]}>
                    {'\u25B2'}
                  </Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {String(minute).padStart(2, '0')}
                </Text>
                <Pressable
                  onPress={() => adjustMinute(-5)}
                  style={styles.arrowBtn}
                >
                  <Text style={[styles.arrow, { color: colors.text }]}>
                    {'\u25BC'}
                  </Text>
                </Pressable>
              </View>

              {/* AM/PM */}
              <View style={styles.periodCol}>
                <Pressable
                  onPress={() => {
                    if (hour >= 12) setHour(hour - 12);
                  }}
                  style={[
                    styles.periodBtn,
                    hour < 12 && {
                      backgroundColor: 'rgba(128,128,128,0.15)',
                      borderColor: colors.text,
                    },
                    { borderColor: hour < 12 ? colors.text : 'rgba(128,128,128,0.2)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.text, opacity: hour < 12 ? 1 : 0.4 },
                    ]}
                  >
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (hour < 12) setHour(hour + 12);
                  }}
                  style={[
                    styles.periodBtn,
                    hour >= 12 && {
                      backgroundColor: 'rgba(128,128,128,0.15)',
                    },
                    { borderColor: hour >= 12 ? colors.text : 'rgba(128,128,128,0.2)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.text, opacity: hour >= 12 ? 1 : 0.4 },
                    ]}
                  >
                    PM
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.preview, { color: colors.text }]}>
              You'll be reminded daily at {formatTime(hour, minute)}
            </Text>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </ScrollView>

      <Toast message={toast} visible={!!toast} onHide={() => setToast('')} />
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
  groupLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(128,128,128,0.3)',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  pickerCol: {
    alignItems: 'center',
    width: 64,
  },
  arrowBtn: {
    padding: 8,
  },
  arrow: {
    fontSize: 14,
    opacity: 0.5,
  },
  pickerValue: {
    fontSize: 36,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  pickerColon: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 4,
  },
  periodCol: {
    marginLeft: 12,
    gap: 8,
  },
  periodBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  preview: {
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.5,
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
