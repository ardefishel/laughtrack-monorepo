import { Icon } from '@/components/ui/ion-icon'
import { BIT_TABLE } from '@/database/constants'
import { Bit as BitModel } from '@/database/models/bit'
import { parseBitTagNames } from '@/database/mappers/bitMapper'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { parseBooleanParam, parseCsvParam, toCsvParam } from '@/utils/filter-query'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, Checkbox, Chip, PressableFeedback, Separator } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

const ALL_STATUSES: { value: BitStatus; label: string; dotClass: string }[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'tested', label: 'Tested', dotClass: 'bg-blue-500' },
    { value: 'final', label: 'Final', dotClass: 'bg-success' },
    { value: 'dead', label: 'Dead', dotClass: 'bg-danger' },
]

export default function BitFilterModal() {
    const database = useDatabase()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; hasPremise?: string }>()
    const [availableTags, setAvailableTags] = useState<string[]>([])

    const [selectedStatuses, setSelectedStatuses] = useState<Set<BitStatus>>(() => {
        return new Set(parseCsvParam(params.statuses) as BitStatus[])
    })

    const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
        return new Set(parseCsvParam(params.tags))
    })

    const [hasPremise, setHasPremise] = useState<boolean | null>(() => parseBooleanParam(params.hasPremise))

    useEffect(() => {
        const subscription = database
            .get<BitModel>(BIT_TABLE)
            .query()
            .observe()
            .subscribe((bits: BitModel[]) => {
                const tagSet = new Set<string>()

                for (const bit of bits) {
                    for (const tag of parseBitTagNames(bit.tagsJson)) {
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

    const toggleStatus = (status: BitStatus) => {
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

    const clearAll = () => {
        setSelectedStatuses(new Set())
        setSelectedTags(new Set())
        setHasPremise(null)
    }

    const applyFilters = () => {
        router.back()
        router.setParams({
            statuses: toCsvParam(selectedStatuses),
            tags: toCsvParam(selectedTags),
            hasPremise: hasPremise !== null ? String(hasPremise) : '',
        })
    }

    const activeCount = selectedStatuses.size + selectedTags.size + (hasPremise !== null ? 1 : 0)

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
            <View className='flex-1 px-6 pt-6 gap-4'>
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
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    PREMISE
                </Text>
                <View className="flex-row gap-2">
                    <Chip
                        size="md"
                        variant={hasPremise === null ? 'primary' : 'tertiary'}
                        color={hasPremise === null ? 'accent' : 'default'}
                        onPress={() => setHasPremise(null)}
                    >
                        <Chip.Label>All</Chip.Label>
                    </Chip>
                    <Chip
                        size="md"
                        variant={hasPremise === true ? 'primary' : 'tertiary'}
                        color={hasPremise === true ? 'accent' : 'default'}
                        onPress={() => setHasPremise(true)}
                    >
                        <Icon name="bulb-outline" size={14} className={hasPremise === true ? 'text-accent-foreground' : 'text-muted'} />
                        <Chip.Label>Has Premise</Chip.Label>
                    </Chip>
                    <Chip
                        size="md"
                        variant={hasPremise === false ? 'primary' : 'tertiary'}
                        color={hasPremise === false ? 'accent' : 'default'}
                        onPress={() => setHasPremise(false)}
                    >
                        <Chip.Label>No Premise</Chip.Label>
                    </Chip>
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
