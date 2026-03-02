import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import { PREMISE_TABLE } from '@/database/constants'
import { parsePremiseTagNames } from '@/database/mappers/premiseMapper'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { Attitude, PremiseStatus } from '@/types'
import { parseCsvParam, toCsvParam } from '@/utils/filter-query'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, Checkbox, Chip, PressableFeedback, Separator } from 'heroui-native'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

const ALL_ATTITUDES = Object.entries(attitudeConfig) as [Attitude, { label: string; emoji: string }][]

const ALL_STATUSES: { value: PremiseStatus; label: string; dotClass: string }[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'ready', label: 'Ready', dotClass: 'bg-success' },
    { value: 'archived', label: 'Archived', dotClass: 'bg-default' },
]

export default function PremiseFilterModal() {
    const database = useDatabase()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; attitudes?: string }>()
    const [allTags, setAllTags] = useState<string[]>([])

    useEffect(() => {
        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .query()
            .observe()
            .subscribe((premises: PremiseModel[]) => {
                const uniqueTags = new Set<string>()
                for (const premise of premises) {
                    const tagNames = parsePremiseTagNames(premise.tagsJson)
                    for (const tagName of tagNames) {
                        uniqueTags.add(tagName)
                    }
                }
                setAllTags([...uniqueTags].sort((a, b) => a.localeCompare(b)))
            })

        return () => subscription.unsubscribe()
    }, [database])

    const [selectedStatuses, setSelectedStatuses] = useState<Set<PremiseStatus>>(() => {
        return new Set(parseCsvParam(params.statuses) as PremiseStatus[])
    })

    const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
        return new Set(parseCsvParam(params.tags))
    })

    const [selectedAttitudes, setSelectedAttitudes] = useState<Set<Attitude>>(() => {
        return new Set(parseCsvParam(params.attitudes) as Attitude[])
    })

    const toggleStatus = (status: PremiseStatus) => {
        setSelectedStatuses((prev) => {
            const next = new Set(prev)
            if (next.has(status)) next.delete(status)
            else next.add(status)
            return next
        })
    }

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => {
            const next = new Set(prev)
            if (next.has(tag)) next.delete(tag)
            else next.add(tag)
            return next
        })
    }

    const toggleAttitude = (attitude: Attitude) => {
        setSelectedAttitudes((prev) => {
            const next = new Set(prev)
            if (next.has(attitude)) next.delete(attitude)
            else next.add(attitude)
            return next
        })
    }

    const clearAll = () => {
        setSelectedStatuses(new Set())
        setSelectedTags(new Set())
        setSelectedAttitudes(new Set())
    }

    const applyFilters = () => {
        router.back()
        router.setParams({
            statuses: toCsvParam(selectedStatuses),
            tags: toCsvParam(selectedTags),
            attitudes: toCsvParam(selectedAttitudes),
        })
    }

    const activeCount = selectedStatuses.size + selectedTags.size + selectedAttitudes.size

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
            <View className='flex-1 px-6 pt-6 gap-4' >
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    STATUS
                </Text>
                <View>
                    {ALL_STATUSES.map((status) => {
                        const isSelected = selectedStatuses.has(status.value)
                        return (
                            <PressableFeedback
                                key={status.value}
                                onPress={() => toggleStatus(status.value)}
                                className="flex-row items-center gap-3 py-3"
                            >
                                <Checkbox
                                    variant='secondary'
                                    isSelected={isSelected}
                                    onSelectedChange={() => toggleStatus(status.value)}
                                />
                                <View className={`size-2.5 rounded-full ${status.dotClass}`} />
                                <Text className="text-foreground text-base">
                                    {status.label}
                                </Text>
                            </PressableFeedback>
                        )
                    })}
                </View>
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    TAGS
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {allTags.map((tag) => {
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
                {allTags.length === 0 && (
                    <Text className="text-muted text-sm">No tags yet.</Text>
                )}
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    ATTITUDE
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {ALL_ATTITUDES.map(([value, config]) => {
                        const isSelected = selectedAttitudes.has(value)
                        return (
                            <Chip
                                key={value}
                                size="md"
                                variant={isSelected ? 'primary' : 'tertiary'}
                                color={isSelected ? 'accent' : 'default'}
                                onPress={() => toggleAttitude(value)}
                            >
                                <Chip.Label>{config.emoji} {config.label}</Chip.Label>
                            </Chip>
                        )
                    })}
                </View>
                <Button variant="primary" className='mt-4' onPress={applyFilters}>
                    <Icon name="funnel" size={18} />
                    <Button.Label>
                        {activeCount > 0 ? `Apply Filters (${activeCount})` : 'Apply Filters'}
                    </Button.Label>
                </Button>
            </View>
        </View>
    )
}
