import React, { memo } from 'react';
import { Chip } from 'heroui-native';

interface TagFilterChipProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

function TagFilterChipComponent({ name, isSelected, onPress }: TagFilterChipProps) {
  return (
    <Chip
      variant={isSelected ? 'primary' : 'secondary'}
      color="accent"
      size="sm"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter by tag ${name}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Chip.Label>#{name}</Chip.Label>
    </Chip>
  );
}

export const TagFilterChip = memo(TagFilterChipComponent);
