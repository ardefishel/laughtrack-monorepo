import React from 'react';
import { Pressable, Text } from 'react-native';

import { AddItemOptions } from './AddItemOptions';
import { Icon } from './Icon';

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
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Add set item" className="flex-row items-center px-4 py-3">
      <Icon name="add" size={18} className="text-muted mr-2" />
      <Text className="text-muted text-base">Add Set Item</Text>
    </Pressable>
  );
}
