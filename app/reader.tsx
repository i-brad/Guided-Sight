import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, Pressable, Modal, TextInput, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useReadingStats } from '@/context/ReadingStatsContext';
import { useHighlights } from '@/context/HighlightsContext';
import { useSpotlight } from '@/hooks/useSpotlight';
import { HeaderBar } from '@/components/HeaderBar';
import { FocusOverlay } from '@/components/FocusOverlay';
import { ReaderControls } from '@/components/ReaderControls';

const IMAGE_REGEX = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function ArticleImage({ uri, maxWidth }: { uri: string; maxWidth: number }) {
  const [aspect, setAspect] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const onLoad = (e: { nativeEvent: { source: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.source;
    if (width && height) setAspect(width / height);
  };

  if (error) return null;

  const width = maxWidth;
  const height = aspect ? width / aspect : width * 0.56;

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri }}
        style={{ width, height, borderRadius: 8 }}
        resizeMode="contain"
        onLoad={onLoad}
        onError={() => setError(true)}
      />
      {!aspect && !error && (
        <View style={[styles.imagePlaceholder, { width, height }]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
}

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, settings } = useTheme();
  const { getItem } = useLibrary();
  const { startTracking, stopTracking } = useReadingStats();
  const { isHighlighted, addHighlight, removeHighlight, getHighlightsForDocument } = useHighlights();
  const { width: screenWidth } = useWindowDimensions();
  const item = getItem(Number(id));
  const documentId = Number(id);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const speechSessionRef = useRef(0);

  // Highlight mode & note modal state
  const [highlightMode, setHighlightMode] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState<{ index: number; text: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  useFocusEffect(
    useCallback(() => {
      startTracking();
      return () => {
        stopTracking();
        speechSessionRef.current++;
        Speech.stop();
        setIsSpeaking(false);
        setIsPaused(false);
      };
    }, [startTracking, stopTracking])
  );

  // Start a new speech session; stale callbacks from previous sessions are ignored
  const startSpeech = (content: string, rate: number) => {
    const session = ++speechSessionRef.current;
    Speech.speak(content, {
      rate,
      onDone: () => {
        if (speechSessionRef.current !== session) return;
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onStopped: () => {
        if (speechSessionRef.current !== session) return;
        setIsSpeaking(false);
        setIsPaused(false);
      },
    });
    setIsSpeaking(true);
    setIsPaused(false);
  };

  // TTS handlers
  const handlePlay = () => {
    if (isPaused) {
      Speech.resume();
      setIsPaused(false);
      return;
    }
    if (!item?.content) return;
    // Stop any lingering speech before starting fresh
    Speech.stop();
    startSpeech(item.content, speechRate);
  };

  const handlePause = () => {
    Speech.pause();
    setIsPaused(true);
  };

  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isSpeaking && !isPaused && item?.content) {
      Speech.stop();
      startSpeech(item.content, rate);
    }
  };

  // Highlight handlers
  const handleParagraphPress = (paragraphIndex: number, text: string) => {
    if (!highlightMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const docHighlights = getHighlightsForDocument(documentId);
    const existing = docHighlights.find((h) => h.paragraphIndex === paragraphIndex);
    if (existing) {
      removeHighlight(existing.id);
    } else {
      setPendingHighlight({ index: paragraphIndex, text });
      setNoteText('');
      setNoteModalVisible(true);
    }
  };

  const handleSaveHighlight = () => {
    if (pendingHighlight) {
      addHighlight(documentId, pendingHighlight.index, pendingHighlight.text, noteText.trim() || undefined);
    }
    setNoteModalVisible(false);
    setPendingHighlight(null);
    setNoteText('');
  };

  const handleCancelHighlight = () => {
    setNoteModalVisible(false);
    setPendingHighlight(null);
    setNoteText('');
  };

  const { spotlightY, spotlightHeight, isDragging, panGesture } = useSpotlight(
    settings.focusHeight,
    settings.spotlightPosition
  );

  const scrollRef = useRef<Animated.ScrollView>(null);
  const nativeGesture = Gesture.Native().withRef(scrollRef as any);
  const composed = Gesture.Simultaneous(panGesture, nativeGesture);

  const paragraphs = item?.content.split('\n\n') ?? [];
  const imageMaxWidth = Math.min(screenWidth - 48, 600);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title={item?.title ?? 'Reader'}
        showBack
        showSettings
      />

      <GestureDetector gesture={composed}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.articleWrap}>
            {paragraphs.map((p, i) => {
              const imageMatch = p.trim().match(IMAGE_REGEX);
              if (imageMatch) {
                return (
                  <ArticleImage
                    key={i}
                    uri={imageMatch[2]}
                    maxWidth={imageMaxWidth}
                  />
                );
              }
              const highlighted = isHighlighted(documentId, i);
              const isPending = pendingHighlight?.index === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => handleParagraphPress(i, p)}
                >
                  <Text
                    style={[
                      styles.paragraph,
                      { color: colors.text, fontSize: settings.fontSize, lineHeight: settings.fontSize * 1.8 },
                      (highlighted || isPending) && {
                        backgroundColor: colors.accent + '25',
                        borderRadius: 4,
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.ScrollView>
      </GestureDetector>

      {!highlightMode && (
        <FocusOverlay
          spotlightY={spotlightY}
          spotlightHeight={spotlightHeight}
          isDragging={isDragging}
        />
      )}

      <ReaderControls
        spotlightHeight={spotlightHeight}
        initialHeight={settings.focusHeight}
        documentId={documentId}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        speechRate={speechRate}
        onPlay={handlePlay}
        onPause={handlePause}
        onSpeechRateChange={handleSpeechRateChange}
        highlightMode={highlightMode}
        onToggleHighlightMode={() => setHighlightMode((prev) => !prev)}
      />

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelHighlight}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancelHighlight}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add a Note</Text>
              <Text style={[styles.modalPreview, { color: colors.mutedText }]} numberOfLines={2}>
                {pendingHighlight?.text}
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.background },
                ]}
                placeholder="Write a note (optional)"
                placeholderTextColor={colors.mutedText}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={handleCancelHighlight}
                  style={[styles.modalBtn, { backgroundColor: colors.background }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.mutedText }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveHighlight}
                  style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.background }]}>Save</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 220,
    paddingHorizontal: 24,
  },
  articleWrap: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  paragraph: {
    fontSize: 19,
    lineHeight: 34,
    fontWeight: '300',
    marginBottom: 24,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  imagePlaceholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
