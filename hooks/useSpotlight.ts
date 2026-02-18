import { useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

export function useSpotlight(initialHeight: number = 80) {
  const contentTop = 120;
  const spotlightY = useSharedValue(contentTop + initialHeight / 2);
  const spotlightHeight = useSharedValue(initialHeight);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      'worklet';
      spotlightY.value = event.absoluteY;
    })
    .onUpdate((event) => {
      'worklet';
      spotlightY.value = event.absoluteY;
    })
    .minDistance(5);

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      'worklet';
      spotlightY.value = withTiming(event.absoluteY, { duration: 200 });
    });

  return { spotlightY, spotlightHeight, panGesture, tapGesture };
}
