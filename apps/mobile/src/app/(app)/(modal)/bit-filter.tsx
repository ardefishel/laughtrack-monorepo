import { FilterModalShell } from '@/features/material/components/filter-modal-shell'
import { Icon } from '@/components/ui/ion-icon'
import { BIT_STATUS_OPTIONS } from '@/config/bit-statuses'
import { BIT_TABLE } from '@/database/constants'
import { Bit as BitModel } from '@/database/models/bit'
import { parseBitTagNames } from '@/database/mappers/bitMapper'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { parseBooleanParam, parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Checkbox, Chip, PressableFeedback } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

export default function BitFilterModal() {
    const router = useRouter()
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
        <FilterModalShell activeCount={activeCount} onClear={clearAll} onApply={applyFilters} applyPrefix={<Icon name='funnel' size={18} />}>
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    STATUS
                </Text>
                <View>
                    {BIT_STATUS_OPTIONS.map((status) => {
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
        </FilterModalShell>
    )
}
