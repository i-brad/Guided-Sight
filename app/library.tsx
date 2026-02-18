import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const { items } = useLibrary();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Library" showSettings showAnalytics />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        key={layout}
        numColumns={layout === 'grid' ? 2 : 1}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={layout === 'grid' ? styles.columnWrapper : undefined}
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
            />
          </View>
        )}
      />

      {/* Floating Add Button */}
      <View style={styles.addBtnWrap}>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            {
              borderColor: 'rgba(128,128,128,0.2)',
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
  addBtnWrap: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(128,128,128,0.1)',
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
