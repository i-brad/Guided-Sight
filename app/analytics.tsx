import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useReadingStats } from '@/context/ReadingStatsContext';
import { HeaderBar } from '@/components/HeaderBar';

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function getWeekData(dailyEntries: { date: string; seconds: number }[]) {
  const days: { label: string; seconds: number; date: string }[] = [];
  const now = new Date();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = dailyEntries.find((e) => e.date === dateStr);
    days.push({
      label: dayLabels[d.getDay()],
      seconds: entry?.seconds ?? 0,
      date: dateStr,
    });
  }
  return days;
}

function StatCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; cardBorder: string };
}) {
  return (
    <View style={[styles.statCard, { borderColor: colors.cardBorder }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { stats, todaySeconds, weekSeconds } = useReadingStats();

  const weekData = getWeekData(stats.dailyEntries);
  const maxBarSeconds = Math.max(...weekData.map((d) => d.seconds), 1);

  const today = new Date().toISOString().split('T')[0];
  const streak = calculateStreak(stats.dailyEntries, today);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Analytics" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          Reading Analytics
        </Text>
        <Text style={styles.subtitle}>Track your reading habits</Text>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today"
            value={formatDuration(todaySeconds)}
            colors={colors}
          />
          <StatCard
            label="This Week"
            value={formatDuration(weekSeconds)}
            colors={colors}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="All Time"
            value={formatDuration(stats.totalSeconds)}
            colors={colors}
          />
          <StatCard
            label="Streak"
            value={`${streak} day${streak !== 1 ? 's' : ''}`}
            colors={colors}
          />
        </View>

        {/* Weekly Bar Chart */}
        <View style={[styles.chartGroup, { borderColor: colors.cardBorder }]}>
          <Text style={styles.chartLabel}>Last 7 Days</Text>
          <View style={styles.chartContainer}>
            {weekData.map((day) => {
              const barHeight =
                day.seconds > 0
                  ? Math.max(4, (day.seconds / maxBarSeconds) * 120)
                  : 4;
              const isToday = day.date === today;

              return (
                <View key={day.date} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday
                            ? colors.text
                            : 'rgba(128,128,128,0.3)',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      { color: isToday ? colors.text : 'rgba(128,128,128,0.4)' },
                    ]}
                  >
                    {day.label}
                  </Text>
                  {day.seconds > 0 && (
                    <Text style={styles.barTime}>
                      {day.seconds < 60
                        ? `${day.seconds}s`
                        : `${Math.floor(day.seconds / 60)}m`}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function calculateStreak(
  dailyEntries: { date: string; seconds: number }[],
  today: string
): number {
  let streak = 0;
  const d = new Date(today);

  // Check if user read today; if not, start from yesterday
  const todayEntry = dailyEntries.find((e) => e.date === today);
  if (!todayEntry || todayEntry.seconds === 0) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    const entry = dailyEntries.find((e) => e.date === dateStr);
    if (entry && entry.seconds > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(128,128,128,0.3)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
  },
  chartGroup: {
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  chartLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(128,128,128,0.3)',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    fontWeight: '500',
  },
  barTime: {
    fontSize: 8,
    color: 'rgba(128,128,128,0.4)',
    marginTop: 2,
  },
});
