import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export interface AddItemButtonProps {
  position: 'top' | 'bottom';
  isExpanded: boolean;
  onPress: () => void;
  onAddJoke: () => void;
  onAddNote: () => void;
}

export function AddItemButton({
  position,
  isExpanded,
  onPress,
  onAddJoke,
  onAddNote,
}: AddItemButtonProps) {
  if (isExpanded) {
    return (
      <View className="flex-row items-center justify-center gap-6 py-3 mx-4 bg-surface rounded-lg">
        <Pressable onPress={onAddJoke} className="flex-row items-center gap-2 px-4 py-2">
          <StyledIonicons name="reader-outline" size={16} className="text-accent" />
          <Text className="text-accent text-sm font-medium">Add Joke</Text>
        </Pressable>
        <View className="w-px h-5 bg-default" />
        <Pressable onPress={onAddNote} className="flex-row items-center gap-2 px-4 py-2">
          <StyledIonicons name="document-text-outline" size={16} className="text-accent" />
          <Text className="text-accent text-sm font-medium">Add Note</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3">
      <StyledIonicons name="add" size={18} className="text-muted mr-2" />
      <Text className="text-muted text-base">Add Set Item</Text>
    </Pressable>
  );
}
