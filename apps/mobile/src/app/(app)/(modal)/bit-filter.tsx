import { FilterModalShell } from '@/features/material/components/filter-modal-shell'
import { Icon } from '@/components/ui/ion-icon'
import { getBitStatusOptions } from '@/config/bit-statuses'
import { BIT_TABLE } from '@/database/constants'
import { Bit as BitModel } from '@/database/models/bit'
import { parseBitTagNames } from '@/database/mappers/bitMapper'
import type { BitStatus } from '@/types'
import { parseBooleanParam, parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useSetToggle } from '@/features/material/hooks/use-set-toggle'
import { useAvailableTags } from '@/features/material/hooks/use-available-tags'
import { useFilterModal } from '@/features/material/hooks/use-filter-modal'
import { useI18n } from '@/i18n'
import { useLocalSearchParams } from 'expo-router'
import { Checkbox, Chip, PressableFeedback } from 'heroui-native'
import { useCallback, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

export default function BitFilterModal() {
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; hasPremise?: string }>()
    const { t } = useI18n()
    const bitStatusOptions = getBitStatusOptions(t)

    const { selected: selectedStatuses, toggle: toggleStatus, clear: clearStatuses } = useSetToggle<BitStatus>(
        parseCsvParam(params.statuses) as BitStatus[],
    )
    const { selected: selectedTags, toggle: toggleTag, clear: clearTags } = useSetToggle<string>(
        parseCsvParam(params.tags),
    )
    const [hasPremise, setHasPremise] = useState<boolean | null>(() => parseBooleanParam(params.hasPremise))

    const availableTags = useAvailableTags<BitModel>(BIT_TABLE, parseBitTagNames)

    const tagsToRender = useMemo(() => {
        if (availableTags.length > 0) return availableTags
        return [...selectedTags].sort((a, b) => a.localeCompare(b))
    }, [availableTags, selectedTags])

    const buildParams = useCallback(() => ({
        statuses: toCsvParam(selectedStatuses),
        tags: toCsvParam(selectedTags),
        hasPremise: hasPremise !== null ? String(hasPremise) : '',
    }), [selectedStatuses, selectedTags, hasPremise])

    const { applyFilters } = useFilterModal(buildParams)

    const clearAll = () => {
        clearStatuses()
        clearTags()
        setHasPremise(null)
    }

    const activeCount = selectedStatuses.size + selectedTags.size + (hasPremise !== null ? 1 : 0)

    return (
        <FilterModalShell activeCount={activeCount} onClear={clearAll} onApply={applyFilters} applyPrefix={<Icon name='funnel' size={18} />}>
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    {t('filters.status')}
                </Text>
                <View>
                    {bitStatusOptions.map((status) => {
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
                    {t('filters.tags')}
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
                    {t('bitMeta.premise')}
                </Text>
                <View className="flex-row gap-2">
                    <Chip
                        size="md"
                        variant={hasPremise === null ? 'primary' : 'tertiary'}
                        color={hasPremise === null ? 'accent' : 'default'}
                        onPress={() => setHasPremise(null)}
                    >
                        <Chip.Label>{t('filters.all')}</Chip.Label>
                    </Chip>
                    <Chip
                        size="md"
                        variant={hasPremise === true ? 'primary' : 'tertiary'}
                        color={hasPremise === true ? 'accent' : 'default'}
                        onPress={() => setHasPremise(true)}
                    >
                        <Icon name="bulb-outline" size={14} className={hasPremise === true ? 'text-accent-foreground' : 'text-muted'} />
                        <Chip.Label>{t('filters.hasPremise')}</Chip.Label>
                    </Chip>
                    <Chip
                        size="md"
                        variant={hasPremise === false ? 'primary' : 'tertiary'}
                        color={hasPremise === false ? 'accent' : 'default'}
                        onPress={() => setHasPremise(false)}
                    >
                        <Chip.Label>{t('filters.noPremise')}</Chip.Label>
                    </Chip>
                </View>
        </FilterModalShell>
    )
}
