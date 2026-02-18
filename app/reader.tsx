import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useReadingStats } from '@/context/ReadingStatsContext';
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
  const { width: screenWidth } = useWindowDimensions();
  const item = getItem(Number(id));

  useFocusEffect(
    useCallback(() => {
      startTracking();
      return () => stopTracking();
    }, [startTracking, stopTracking])
  );

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
              return (
                <Text
                  key={i}
                  style={[
                    styles.paragraph,
                    { color: colors.text, fontSize: settings.fontSize, lineHeight: settings.fontSize * 1.8 },
                  ]}
                >
                  {p}
                </Text>
              );
            })}
          </View>
        </Animated.ScrollView>
      </GestureDetector>

      <FocusOverlay
        spotlightY={spotlightY}
        spotlightHeight={spotlightHeight}
        isDragging={isDragging}
      />

      <ReaderControls spotlightHeight={spotlightHeight} />
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
});
