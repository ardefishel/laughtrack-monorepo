import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';

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
        <View className="flex-row items-center justify-center gap-6 py-3 mx-4 bg-surface rounded-lg">
          <Pressable onPress={onAddJoke} className="flex-row items-center gap-2 px-4 py-2">
            <StyledIonicons name="reader-outline" size={16} className="text-primary" />
            <Text className="text-primary text-sm font-medium">Add Joke</Text>
          </Pressable>
          <View className="w-px h-5 bg-default" />
          <Pressable onPress={onAddNote} className="flex-row items-center gap-2 px-4 py-2">
            <StyledIonicons name="document-text-outline" size={16} className="text-primary" />
            <Text className="text-primary text-sm font-medium">Add Note</Text>
          </Pressable>
        </View>
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
