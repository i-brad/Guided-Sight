import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LibraryItem } from '@/types';

interface DocCardProps {
  item: LibraryItem;
  onPress: () => void;
}

export function DocCard({ item, onPress }: DocCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? 'rgba(128,128,128,0.1)'
            : colors.cardBackground,
          borderColor: colors.cardBorder,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.typeTag}>{item.type}</Text>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  typeTag: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(128,128,128,0.5)',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
