import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { HeaderBar } from '@/components/HeaderBar';
import { DocCard } from '@/components/DocCard';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING = 24;
const CARD_WIDTH = (width - PADDING * 2 - COLUMN_GAP) / 2;

export default function LibraryScreen() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, removeItem } = useLibrary();

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Delete', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Library" showSettings showAnalytics />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color={colors.text} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No reads yet
          </Text>
          <Text style={[styles.emptyHint, { color: colors.text }]}>
            TAP + TO ADD YOUR FIRST READ
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          key={layout}
          numColumns={layout === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={layout === 'grid' ? styles.columnWrapper : undefined}
          ItemSeparatorComponent={layout === 'list' ? () => <View style={{ height: COLUMN_GAP }} /> : undefined}
          ListHeaderComponent={
            <View style={styles.headerRow}>
              <Text style={[styles.heading, { color: colors.text }]}>
                Your Reads
              </Text>
              <View style={styles.toggleRow}>
                <Pressable onPress={() => setLayout('grid')}>
                  <Ionicons
                    name="grid"
                    size={16}
                    color={colors.text}
                    style={{ opacity: layout === 'grid' ? 1 : 0.3 }}
                  />
                </Pressable>
                <Pressable onPress={() => setLayout('list')}>
                  <Ionicons
                    name="list"
                    size={16}
                    color={colors.text}
                    style={{ opacity: layout === 'list' ? 1 : 0.3 }}
                  />
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={layout === 'grid' ? { width: CARD_WIDTH } : undefined}>
              <DocCard
                item={item}
                onPress={() => router.push(`/reader?id=${item.id}`)}
                onLongPress={() => handleDelete(item.id, item.title)}
              />
            </View>
          )}
        />
      )}

      {/* Floating Add Button */}
      <View style={[styles.addBtnWrap, { bottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={() => router.push('/import')}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 100,
    paddingHorizontal: PADDING,
    paddingBottom: 120,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: COLUMN_GAP,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    opacity: 0.4,
  },
  addBtnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
