import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AddItemOptions } from './AddItemOptions';
import { Icon } from './Icon';

export interface AddItemSeparatorProps {
  isVisible: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onAddJoke: () => void;
  onAddNote: () => void;
}

export function AddItemSeparator({
  isVisible,
  isExpanded,
  onPress,
  onAddJoke,
  onAddNote,
}: AddItemSeparatorProps) {
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    } else {
      opacity.value = withTiming(0, { duration: 80 });
    }
  }, [isVisible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {isExpanded ? (
        <AddItemOptions onAddJoke={onAddJoke} onAddNote={onAddNote} />
      ) : (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Add item to set"
          className="h-8 mx-4 justify-center items-center min-h-[44px]"
        >
          <View className="absolute w-full h-px bg-default" />
          <View className="bg-background px-1">
            <Icon name="add-circle-outline" size={16} className="text-muted-dim" />
          </View>
        </Pressable>
      )}
    </Animated.View>
  );
}
