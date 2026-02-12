import { Chip } from 'heroui-native';
import React, { memo, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { TagFilterChip } from './TagFilterChip';

interface TagFilterBarProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
}

function TagFilterBarComponent({ tags, selectedTags, onToggleTag, onClearAll }: TagFilterBarProps) {
  const allSelected = selectedTags.length === 0;

  const handleToggle = useCallback((tag: string) => {
    onToggleTag(tag);
  }, [onToggleTag]);

  if (tags.length === 0) return null;

  return (
    <View className="pb-4 pt-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          variant={allSelected ? 'primary' : 'secondary'}
          color="default"
          size="sm"
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Show all jokes"
          accessibilityState={{ selected: allSelected }}
        >
          <Chip.Label>All</Chip.Label>
        </Chip>

        {tags.map((tag) => (
          <TagFilterChip
            key={tag}
            name={tag}
            isSelected={selectedTags.includes(tag)}
            onPress={() => handleToggle(tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export const TagFilterBar = memo(TagFilterBarComponent);
