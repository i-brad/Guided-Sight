import Animated, { useAnimatedStyle, SharedValue, interpolate } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const FADE_HEIGHT = 80;

interface FocusOverlayProps {
  spotlightY: SharedValue<number>;
  spotlightHeight: SharedValue<number>;
  isDragging: SharedValue<number>;
}

export function FocusOverlay({ spotlightY, spotlightHeight, isDragging }: FocusOverlayProps) {
  const { colors } = useTheme();
  const op = colors.overlayOpacity;
  const base = colors.overlayBase;
  const overlayColor = `rgba(${base}, ${op})`;
  const fadeColors = [
    `rgba(${base}, ${op})`,
    `rgba(${base}, ${op * 0.85})`,
    `rgba(${base}, ${op * 0.6})`,
    `rgba(${base}, ${op * 0.3})`,
    `rgba(${base}, ${op * 0.1})`,
    `rgba(${base}, 0)`,
  ] as const;
  const fadeLocations = [0, 0.15, 0.35, 0.6, 0.8, 1] as const;

  const topStyle = useAnimatedStyle(() => {
    const topEnd = Math.max(0, spotlightY.value - spotlightHeight.value / 2 - FADE_HEIGHT);
    return { height: topEnd };
  });

  const bottomStyle = useAnimatedStyle(() => {
    const bottomStart = spotlightY.value + spotlightHeight.value / 2 + FADE_HEIGHT;
    return { top: bottomStart };
  });

  const topFadeStyle = useAnimatedStyle(() => {
    const topEnd = Math.max(0, spotlightY.value - spotlightHeight.value / 2 - FADE_HEIGHT);
    return { top: topEnd };
  });

  const bottomFadeStyle = useAnimatedStyle(() => {
    const bottomStart = spotlightY.value + spotlightHeight.value / 2;
    return { top: bottomStart };
  });

  const topEdgeStyle = useAnimatedStyle(() => {
    const topEnd = Math.max(0, spotlightY.value - spotlightHeight.value / 2);
    return {
      top: topEnd,
      opacity: interpolate(isDragging.value, [0, 1], [0, 0.6]),
    };
  });

  const bottomEdgeStyle = useAnimatedStyle(() => {
    const bottomStart = spotlightY.value + spotlightHeight.value / 2;
    return {
      top: bottomStart - 1,
      opacity: interpolate(isDragging.value, [0, 1], [0, 0.6]),
    };
  });

  return (
    <>
      {/* Solid overlay top */}
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, styles.top, { backgroundColor: overlayColor }, topStyle]}
      />

      {/* Top fade: overlay → transparent (cloudy falloff) */}
      <Animated.View pointerEvents="none" style={[styles.fade, topFadeStyle]}>
        <LinearGradient
          colors={[...fadeColors]}
          locations={[...fadeLocations]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom fade: transparent → overlay (cloudy falloff) */}
      <Animated.View pointerEvents="none" style={[styles.fade, bottomFadeStyle]}>
        <LinearGradient
          colors={[...fadeColors].reverse()}
          locations={[...fadeLocations]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Solid overlay bottom */}
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, styles.bottom, { backgroundColor: overlayColor }, bottomStyle]}
      />

      {/* Drag indicator edges */}
      <Animated.View
        pointerEvents="none"
        style={[styles.edge, { backgroundColor: colors.accent }, topEdgeStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.edge, { backgroundColor: colors.accent }, bottomEdgeStyle]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
    zIndex: 10,
  },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    zIndex: 11,
  },
});
