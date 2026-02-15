import React, { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

import { Icon } from './Icon';

export interface SortableListItemProps {
  isActive: boolean;
  onLongPress: () => void;
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function SortableListItem({
  isActive,
  onLongPress,
  onPress,
  disabled = false,
  children,
}: SortableListItemProps) {
  const isPressDisabled = disabled || isActive;

  return (
    <ScaleDecorator activeScale={1.02}>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={120}
        onPress={onPress}
        disabled={isPressDisabled}
        accessibilityRole="button"
        accessibilityLabel="Sortable list item"
        accessibilityState={{ disabled: isPressDisabled }}
        className={`flex-row items-center px-4 py-3 min-h-[44px] ${isActive ? 'bg-surface rounded-lg mx-1' : ''}`}
      >
        <Icon
          name="menu"
          size={18}
          className={isActive ? 'text-accent' : 'text-muted-dim'}
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          {children}
        </View>
      </Pressable>
    </ScaleDecorator>
  );
}
