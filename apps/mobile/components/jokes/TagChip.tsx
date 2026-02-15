import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import { Icon } from '@/components/ui/Icon';

const StyledPressable = withUniwind(Pressable);

interface TagChipProps {
  name: string;
  onRemove?: () => void;
}

export function TagChip({ name, onRemove }: TagChipProps) {
  return (
    <View className="flex-row items-center bg-accent/15 rounded-full px-2.5 py-1 mr-1.5 mb-1.5">
      <Text className="text-xs text-accent font-medium">#{name}</Text>
      {onRemove && (
        <StyledPressable
          onPress={onRemove}
          className="ml-1"
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${name}`}
          hitSlop={8}
        >
          <Icon name="close-circle" size={14} className="text-accent/60" />
        </StyledPressable>
      )}
    </View>
  );
}
