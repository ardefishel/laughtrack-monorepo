import { FilterModalShell } from '@/features/material/components/filter-modal-shell'
import { Icon } from '@/components/ui/ion-icon'
import { SETLIST_TABLE } from '@/database/constants'
import { parseSetlistTagNames } from '@/database/mappers/setlistMapper'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import { toCsvParam, parseCsvParam } from '@/features/material/filters/filter-query'
import { useSetToggle } from '@/features/material/hooks/use-set-toggle'
import { useAvailableTags } from '@/features/material/hooks/use-available-tags'
import { useFilterModal } from '@/features/material/hooks/use-filter-modal'
import { useLocalSearchParams } from 'expo-router'
import { Chip } from 'heroui-native'
import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'

export default function SetlistFilterModal() {
    const params = useLocalSearchParams<{ tags?: string }>()

    const { selected: selectedTags, toggle: toggleTag, clear: clearTags } = useSetToggle<string>(
        parseCsvParam(params.tags),
    )

    const availableTags = useAvailableTags<SetlistModel>(SETLIST_TABLE, parseSetlistTagNames)

    const tagsToRender = useMemo(() => {
        if (availableTags.length > 0) return availableTags
        return [...selectedTags].sort((a, b) => a.localeCompare(b))
    }, [availableTags, selectedTags])

    const buildParams = useCallback(() => ({
        tags: toCsvParam(selectedTags),
    }), [selectedTags])

    const { applyFilters } = useFilterModal(buildParams)

    const activeCount = selectedTags.size

    return (
        <FilterModalShell
            activeCount={activeCount}
            onClear={clearTags}
            onApply={applyFilters}
            applyPrefix={<Icon name='funnel' size={18} />}
        >
                <Text className="text-muted text-xs font-semibold tracking-[2px]">TAGS</Text>
                <View className="flex-row flex-wrap gap-2">
                    {tagsToRender.map((tag) => {
                        const isSelected = selectedTags.has(tag)
                        return (
                            <Chip
                                key={tag}
                                size="md"
                                variant={isSelected ? 'primary' : 'tertiary'}
                                color={isSelected ? 'accent' : 'default'}
                                onPress={() => toggleTag(tag)}
                            >
                                <Chip.Label>#{tag}</Chip.Label>
                            </Chip>
                        )
                    })}
                </View>
                {tagsToRender.length === 0 && (
                    <Text className="text-muted text-sm">No tags yet.</Text>
                )}
        </FilterModalShell>
    )
}
