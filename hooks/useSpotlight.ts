import { useEffect } from 'react';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SpotlightPosition } from '@/types';

const contentTop = 120;
const controlsHeight = 140;

function computeInitialY(position: SpotlightPosition, spotlightHeight: number): number {
  const screenHeight = Dimensions.get('window').height;
  const readableBottom = screenHeight - controlsHeight;

  switch (position) {
    case 'top':
      return contentTop + spotlightHeight / 2;
    case 'center':
      return (contentTop + readableBottom) / 2;
    case 'bottom':
      return readableBottom - spotlightHeight / 2;
  }
}

export function useSpotlight(initialHeight: number = 80, position: SpotlightPosition = 'top') {
  const spotlightY = useSharedValue(computeInitialY(position, initialHeight));
  const spotlightHeight = useSharedValue(initialHeight);

  useEffect(() => {
    spotlightY.value = computeInitialY(position, initialHeight);
  }, [position, initialHeight]);

  useEffect(() => {
    spotlightHeight.value = initialHeight;
  }, [initialHeight]);

  const isDragging = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      isDragging.value = 1;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      'worklet';
      spotlightY.value = event.absoluteY;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = 0;
    })
    .activateAfterLongPress(300);

  return { spotlightY, spotlightHeight, isDragging, panGesture };
}
