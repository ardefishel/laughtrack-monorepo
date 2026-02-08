import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { AddItemOptions } from './AddItemOptions';

const StyledIonicons = withUniwind(Ionicons);

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
        <Pressable onPress={onPress} className="h-8 mx-4 justify-center items-center">
          <View className="absolute w-full h-px bg-default" />
          <View className="bg-background px-1">
            <StyledIonicons name="add-circle-outline" size={16} className="text-muted-dim" />
          </View>
        </Pressable>
      )}
    </Animated.View>
  );
}
