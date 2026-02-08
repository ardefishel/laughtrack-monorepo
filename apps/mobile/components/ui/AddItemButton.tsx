import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { withUniwind } from 'uniwind';

import { AddItemOptions } from './AddItemOptions';

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
    return <AddItemOptions onAddJoke={onAddJoke} onAddNote={onAddNote} />;
  }

  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3">
      <StyledIonicons name="add" size={18} className="text-muted mr-2" />
      <Text className="text-muted text-base">Add Set Item</Text>
    </Pressable>
  );
}
