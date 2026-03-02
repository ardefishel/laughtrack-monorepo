import { Icon } from '@/components/ui/ion-icon'
import { SETLIST_TABLE } from '@/database/constants'
import { parseSetlistTagNames } from '@/database/mappers/setlistMapper'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import { parseCsvParam, toCsvParam } from '@/utils/filter-query'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, Chip, Separator } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function SetlistFilterModal() {
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
        router.setParams({
            tags: toCsvParam(selectedTags),
        })
    }

    const activeCount = selectedTags.size

    return (
        <View style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-field">
                <Button variant="ghost" onPress={() => router.back()}>
                    <Button.Label>Cancel</Button.Label>
                </Button>
                <Text className="text-foreground text-lg font-semibold">Filters</Text>
                <Button variant="ghost" onPress={clearAll} isDisabled={activeCount === 0}>
                    <Button.Label>Reset</Button.Label>
                </Button>
            </View>
            <Separator />

            <ScrollView contentContainerClassName="px-6 pt-6 gap-4 pb-8">
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

                <Button variant="primary" className="mt-4" onPress={applyFilters}>
                    <Icon name="funnel" size={18} />
                    <Button.Label>
                        {activeCount > 0 ? `Apply Filters (${activeCount})` : 'Apply Filters'}
                    </Button.Label>
                </Button>
            </ScrollView>
        </View>
    )
}
