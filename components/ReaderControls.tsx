import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { SharedValue, runOnJS } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

interface ReaderControlsProps {
  spotlightHeight: SharedValue<number>;
}

export function ReaderControls({ spotlightHeight }: ReaderControlsProps) {
  const { colors } = useTheme();
  const [sliderVal, setSliderVal] = useState(spotlightHeight.value);

  const handleChange = (val: number) => {
    spotlightHeight.value = val;
    setSliderVal(val);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `rgba(${colors.overlayBase}, 0.8)`,
          borderTopColor: 'rgba(128,128,128,0.1)',
        },
      ]}
    >
      <View style={styles.sliderWrapper}>
        <View style={styles.labels}>
          <Text style={styles.label}>Narrow Focus</Text>
          <Text style={styles.label}>Wide Focus</Text>
        </View>
        <Slider
          minimumValue={40}
          maximumValue={220}
          value={sliderVal}
          onValueChange={handleChange}
          minimumTrackTintColor="rgba(128,128,128,0.3)"
          maximumTrackTintColor="rgba(128,128,128,0.2)"
          thumbTintColor={colors.text}
          style={styles.slider}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 1200,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sliderWrapper: {
    gap: 6,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    color: 'rgba(128,128,128,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slider: {
    width: '100%',
    height: 20,
  },
});
