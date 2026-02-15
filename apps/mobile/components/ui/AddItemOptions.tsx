import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from './Icon';

export interface AddItemOptionsProps {
  onAddJoke: () => void;
  onAddNote: () => void;
}

export function AddItemOptions({ onAddJoke, onAddNote }: AddItemOptionsProps) {
  return (
    <View className="flex-row items-center justify-center gap-6 py-3 mx-4 bg-surface rounded-lg">
      <Pressable onPress={onAddJoke} accessibilityRole="button" accessibilityLabel="Add joke to set" className="flex-row items-center gap-2 px-4 py-2">
        <Icon name="reader-outline" size={16} className="text-accent" />
        <Text className="text-accent text-sm font-medium">Add Joke</Text>
      </Pressable>
      <View className="w-px h-5 bg-default" />
      <Pressable onPress={onAddNote} accessibilityRole="button" accessibilityLabel="Add note to set" className="flex-row items-center gap-2 px-4 py-2">
        <Icon name="document-text-outline" size={16} className="text-accent" />
        <Text className="text-accent text-sm font-medium">Add Note</Text>
      </Pressable>
    </View>
  );
}
