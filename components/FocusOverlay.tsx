import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface FocusOverlayProps {
  spotlightY: SharedValue<number>;
  spotlightHeight: SharedValue<number>;
}

export function FocusOverlay({ spotlightY, spotlightHeight }: FocusOverlayProps) {
  const { colors } = useTheme();
  const overlayColor = `rgba(${colors.overlayBase}, ${colors.overlayOpacity})`;

  const topStyle = useAnimatedStyle(() => {
    const topEnd = Math.max(0, spotlightY.value - spotlightHeight.value / 2);
    return { height: topEnd };
  });

  const bottomStyle = useAnimatedStyle(() => {
    const bottomStart = spotlightY.value + spotlightHeight.value / 2;
    return { top: bottomStart };
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          styles.top,
          { backgroundColor: overlayColor },
          topStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          styles.bottom,
          { backgroundColor: overlayColor },
          bottomStyle,
        ]}
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
});
