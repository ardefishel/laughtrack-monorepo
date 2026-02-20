import { TagFilterChip } from '@/components/jokes/TagFilterChip';
import { Icon } from '@/components/ui/Icon';
import { useJokeFilters } from '@/context/JokeFilterContext';
import { useAllTags } from '@/hooks/jokes';
import { useRouter } from 'expo-router';
import { Input, TextField } from 'heroui-native';
import React, { useCallback, useRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function SearchFilterSheet() {
    const router = useRouter();
    const filters = useJokeFilters();
    const inputRef = useRef<TextInput>(null);
    const { tags: availableTags } = useAllTags();

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <View collapsable={false} className="p-5 bg-surface flex h-screen flex-1">
            {/* Header row */}
            <View collapsable={false} className="flex-row items-center justify-between mb-6">
                <Text className="text-foreground text-lg font-semibold">
                    Search & Filter
                </Text>
                <View className="flex-row items-center gap-3">
                    {filters.hasActiveFilters && (
                        <Pressable
                            onPress={filters.clearAll}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Clear all filters"
                            className="min-h-[44px] justify-center items-center"
                        >
                            <Text className="text-accent text-sm font-medium">Clear All</Text>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={handleClose}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Close search and filter"
                        className="min-h-[44px] min-w-[44px] justify-center items-center"
                    >
                        <Icon name="close" size={24} className="text-muted" />
                    </Pressable>
                </View>
            </View>

            {/* Search input */}
            <View className="mb-6">
                <TextField className="w-full">
                    <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <Icon name="search" size={18} className="text-muted" />
                    </View>
                    <Input
                        ref={inputRef}
                        placeholder="Search jokes..."
                        placeholderTextColor="var(--field-placeholder)"
                        value={filters.searchQuery}
                        onChangeText={filters.setSearchQuery}
                        accessibilityLabel="Search jokes"
                        variant="primary"
                        className="text-foreground py-3 pl-10"
                        autoFocus
                    />
                </TextField>
            </View>

            {/* Tags section */}
            {availableTags.length > 0 && (
                <View className="flex-1">
                    <Text className="text-foreground text-sm font-medium mb-3">Tags</Text>
                    <ScrollView
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {availableTags.map((tag) => (
                            <TagFilterChip
                                key={tag}
                                name={tag}
                                isSelected={filters.selectedTags.includes(tag)}
                                onPress={() => filters.toggleTag(tag)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}
