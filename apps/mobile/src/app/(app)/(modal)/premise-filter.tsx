import { FilterModalShell } from '@/features/material/components/filter-modal-shell'
import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import { PREMISE_STATUS_OPTIONS } from '@/config/premise-statuses'
import { PREMISE_TABLE } from '@/database/constants'
import { parsePremiseTagNames } from '@/database/mappers/premiseMapper'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { Attitude, PremiseStatus } from '@/types'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useSetToggle } from '@/features/material/hooks/use-set-toggle'
import { useAvailableTags } from '@/features/material/hooks/use-available-tags'
import { useFilterModal } from '@/features/material/hooks/use-filter-modal'
import { useI18n } from '@/i18n'
import { useLocalSearchParams } from 'expo-router'
import { Checkbox, Chip, PressableFeedback } from 'heroui-native'
import { useCallback } from 'react'
import { Text, View } from 'react-native'

const ALL_ATTITUDES = Object.entries(attitudeConfig) as [Attitude, { label: string; emoji: string }][]

export default function PremiseFilterModal() {
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; attitudes?: string }>()
    const { t } = useI18n()

    const { selected: selectedStatuses, toggle: toggleStatus, clear: clearStatuses } = useSetToggle<PremiseStatus>(
        parseCsvParam(params.statuses) as PremiseStatus[],
    )
    const { selected: selectedTags, toggle: toggleTag, clear: clearTags } = useSetToggle<string>(
        parseCsvParam(params.tags),
    )
    const { selected: selectedAttitudes, toggle: toggleAttitude, clear: clearAttitudes } = useSetToggle<Attitude>(
        parseCsvParam(params.attitudes) as Attitude[],
    )

    const allTags = useAvailableTags<PremiseModel>(PREMISE_TABLE, parsePremiseTagNames)

    const buildParams = useCallback(() => ({
        statuses: toCsvParam(selectedStatuses),
        tags: toCsvParam(selectedTags),
        attitudes: toCsvParam(selectedAttitudes),
    }), [selectedStatuses, selectedTags, selectedAttitudes])

    const { applyFilters } = useFilterModal(buildParams)

    const clearAll = () => {
        clearStatuses()
        clearTags()
        clearAttitudes()
    }

    const activeCount = selectedStatuses.size + selectedTags.size + selectedAttitudes.size

    return (
        <FilterModalShell activeCount={activeCount} onClear={clearAll} onApply={applyFilters} applyPrefix={<Icon name='funnel' size={18} />}>
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    {t('filters.status')}
                </Text>
                <View>
                    {PREMISE_STATUS_OPTIONS.map((status) => {
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
                    <Text className="text-muted text-sm">{t('filters.noTagsYet')}</Text>
                )}
                <Text className="text-muted text-xs font-semibold tracking-[2px]">
                    {t('filters.attitude')}
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
        </FilterModalShell>
    )
}
