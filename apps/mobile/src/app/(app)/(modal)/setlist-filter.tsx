import { FilterModalShell } from '@/features/material/components/filter-modal-shell'
import { Icon } from '@/components/ui/ion-icon'
import { SETLIST_TABLE } from '@/database/constants'
import { parseSetlistTagNames } from '@/database/mappers/setlistMapper'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Chip } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

export default function SetlistFilterModal() {
    const router = useRouter()
    const database = useDatabase()
    const params = useLocalSearchParams<{ tags?: string }>()
    const [availableTags, setAvailableTags] = useState<string[]>([])

    const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
        return new Set(parseCsvParam(params.tags))
    })

    useEffect(() => {
        const subscription = database
            .get<SetlistModel>(SETLIST_TABLE)
            .query()
            .observe()
            .subscribe((setlists: SetlistModel[]) => {
                const tagSet = new Set<string>()

                for (const setlist of setlists) {
                    for (const tag of parseSetlistTagNames(setlist.tagsJson)) {
                        tagSet.add(tag)
                    }
                }

                setAvailableTags([...tagSet].sort((a, b) => a.localeCompare(b)))
            })

        return () => subscription.unsubscribe()
    }, [database])

    const tagsToRender = useMemo(() => {
        if (availableTags.length > 0) return availableTags
        return [...selectedTags].sort((a, b) => a.localeCompare(b))
    }, [availableTags, selectedTags])

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => {
            const next = new Set(prev)
            if (next.has(tag)) next.delete(tag)
            else next.add(tag)
            return next
        })
    }

    const clearAll = () => {
        setSelectedTags(new Set())
    }

    const applyFilters = () => {
        router.back()
        requestAnimationFrame(() => {
            router.setParams({
                tags: toCsvParam(selectedTags),
            })
        })
    }

    const activeCount = selectedTags.size

    return (
        <FilterModalShell
            activeCount={activeCount}
            onClear={clearAll}
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
