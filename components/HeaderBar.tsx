import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface HeaderBarProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showAnalytics?: boolean;
  onBack?: () => void;
}

export function HeaderBar({
  title,
  showBack = false,
  showSettings = false,
  showAnalytics = false,
  onBack,
}: HeaderBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}
    >
      {showBack ? (
        <Pressable
          style={styles.leftBtn}
          onPress={onBack ?? (() => router.back())}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.mutedText} />
        </Pressable>
      ) : (
        <View style={styles.leftBtn} />
      )}

      <Text style={[styles.title, { color: colors.mutedText }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightBtns}>
        {showAnalytics && (
          <Pressable
            onPress={() => router.push('/analytics')}
            hitSlop={12}
          >
            <Ionicons name="bar-chart-outline" size={18} color={colors.mutedText} />
          </Pressable>
        )}
        {showSettings && (
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
          >
            <Ionicons name="settings-outline" size={20} color={colors.mutedText} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 100,
  },
  leftBtn: {
    width: 32,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rightBtns: {
    minWidth: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
});
