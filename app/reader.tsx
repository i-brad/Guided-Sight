import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedRef } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useReadingStats } from '@/context/ReadingStatsContext';
import { useSpotlight } from '@/hooks/useSpotlight';
import { HeaderBar } from '@/components/HeaderBar';
import { FocusOverlay } from '@/components/FocusOverlay';
import { ReaderControls } from '@/components/ReaderControls';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, settings } = useTheme();
  const { getItem } = useLibrary();
  const { startTracking, stopTracking } = useReadingStats();
  const item = getItem(Number(id));

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const { spotlightY, spotlightHeight, panGesture } = useSpotlight(
    settings.focusHeight
  );

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const nativeGesture = Gesture.Native().withRef(scrollRef);
  const composed = Gesture.Simultaneous(panGesture, nativeGesture);

  const paragraphs = item?.content.split('\n\n') ?? [];

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
            {paragraphs.map((p, i) => (
              <Text
                key={i}
                style={[
                  styles.paragraph,
                  { color: colors.text },
                ]}
              >
                {p}
              </Text>
            ))}
          </View>
        </Animated.ScrollView>
      </GestureDetector>

      <FocusOverlay
        spotlightY={spotlightY}
        spotlightHeight={spotlightHeight}
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
});
