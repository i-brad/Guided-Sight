import { useSharedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

export function useSpotlight(initialHeight: number = 80) {
  const screenHeight = Dimensions.get('window').height;
  const spotlightY = useSharedValue(screenHeight / 2);
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
    .minDistance(0);

  return { spotlightY, spotlightHeight, panGesture };
}
