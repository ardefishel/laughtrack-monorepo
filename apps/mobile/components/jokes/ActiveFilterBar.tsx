import { Icon } from '@/components/ui/Icon';
import { Chip } from 'heroui-native';
import React, { memo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

interface ActiveFilterBarProps {
    searchQuery: string;
    selectedTags: string[];
    onRemoveSearch: () => void;
    onRemoveTag: (tag: string) => void;
    onClearAll: () => void;
    onPress: () => void;
}

function ActiveFilterBarComponent({
    searchQuery,
    selectedTags,
    onRemoveSearch,
    onRemoveTag,
    onClearAll,
    onPress,
}: ActiveFilterBarProps) {
    const hasSearch = searchQuery.trim().length > 0;
    const hasTags = selectedTags.length > 0;
    if (!hasSearch && !hasTags) return null;

    return (
        <Pressable onPress={onPress} className="pb-3 pt-1" accessibilityRole="button" accessibilityLabel="Edit filters">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                {hasSearch && (
                    <Chip
                        variant="primary"
                        color="accent"
                        size="sm"
                        onPress={onRemoveSearch}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove search filter: ${searchQuery}`}
                    >
                        <Icon name="search" size={12} className="text-accent-foreground mr-1" />
                        <Chip.Label>{searchQuery}</Chip.Label>
                        <Icon name="close-circle" size={14} className="text-accent-foreground/70 ml-1" />
                    </Chip>
                )}

                {selectedTags.map((tag) => (
                    <Chip
                        key={tag}
                        variant="primary"
                        color="accent"
                        size="sm"
                        onPress={() => onRemoveTag(tag)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove tag filter: ${tag}`}
                    >
                        <Chip.Label>#{tag}</Chip.Label>
                        <Icon name="close-circle" size={14} className="text-accent-foreground/70 ml-1" />
                    </Chip>
                ))}

                <Pressable
                    onPress={onClearAll}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all filters"
                    className="px-2 py-1"
                >
                    <Text className="text-accent text-xs font-semibold">Clear All</Text>
                </Pressable>
            </ScrollView>
        </Pressable>
    );
}

export const ActiveFilterBar = memo(ActiveFilterBarComponent);
