import { HeaderBar } from "@/components/HeaderBar";
import { useHighlights } from "@/context/HighlightsContext";
import { useLibrary } from "@/context/LibraryContext";
import { useTheme } from "@/context/ThemeContext";
import { Highlight } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HighlightsScreen() {
  const { colors } = useTheme();
  const { items } = useLibrary();
  const { highlights, removeHighlight } = useHighlights();
  const insets = useSafeAreaInsets();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null,
  );

  const getDocTitle = (documentId: number) => {
    const doc = items.find((i) => i.id === documentId);
    return doc?.title ?? "Unknown Document";
  };

  const handlePress = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
  };

  const handleLongPress = (highlight: Highlight) => {
    Alert.alert(
      "Delete Highlight",
      "Are you sure you want to remove this highlight?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeHighlight(highlight.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Highlight }) => (
    <Pressable
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="bookmark" size={14} color={colors.accent} />
        <Text
          style={[styles.docTitle, { color: colors.mutedText }]}
          numberOfLines={1}
        >
          {getDocTitle(item.documentId)}
        </Text>
      </View>
      <Text
        style={[styles.highlightText, { color: colors.text }]}
        numberOfLines={4}
      >
        {item.text}
      </Text>
      {item.note ? (
        <View style={[styles.noteRow, { borderColor: colors.cardBorder }]}>
          <Ionicons name="create-outline" size={12} color={colors.accent} />
          <Text
            style={[styles.noteText, { color: colors.mutedText }]}
            numberOfLines={2}
          >
            {item.note}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.hint, { color: colors.mutedText }]}>
        Long-press to delete
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Highlights" showBack />

      {highlights.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="bookmark-outline"
            size={48}
            color={colors.mutedText}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No highlights yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedText }]}>
            Tap a paragraph to save it
          </Text>
        </View>
      ) : (
        <FlatList
          data={highlights}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={!!selectedHighlight}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedHighlight(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedHighlight(null)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="bookmark" size={16} color={colors.accent} />
              <Text
                style={[styles.modalDocTitle, { color: colors.mutedText }]}
                numberOfLines={1}
              >
                {selectedHighlight
                  ? getDocTitle(selectedHighlight.documentId)
                  : ""}
              </Text>
              <Pressable
                onPress={() => setSelectedHighlight(null)}
                hitSlop={12}
              >
                <Ionicons name="close" size={20} color={colors.mutedText} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalHighlightText, { color: colors.text }]}>
                {selectedHighlight?.text}
              </Text>

              {selectedHighlight?.note ? (
                <View
                  style={[
                    styles.modalNoteSection,
                    { borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.modalNoteLabel}>
                    <Ionicons
                      name="create-outline"
                      size={14}
                      color={colors.accent}
                    />
                    <Text
                      style={[
                        styles.modalNoteLabelText,
                        { color: colors.accent },
                      ]}
                    >
                      Note
                    </Text>
                  </View>
                  <Text
                    style={[styles.modalNoteText, { color: colors.mutedText }]}
                  >
                    {selectedHighlight.note}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 100,
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  docTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "300",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontStyle: "italic",
  },
  hint: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "70%",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalDocTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalScroll: {
    flexShrink: 1,
  },
  modalHighlightText: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "300",
  },
  modalNoteSection: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
  },
  modalNoteLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalNoteLabelText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalNoteText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
