import { Icon } from '@/components/ui/ion-icon'
import { PREMISE_STATUS_CONFIG, getPremiseStatusLabel } from '@/config/premise-statuses'
import { attitudeConfig, getAttitudeLabel } from '@/config/attitudes'
import { MaterialCard } from '@/features/material/components/material-card'
import { useI18n } from '@/i18n'
import type { Premise, PremiseStatus } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Chip } from 'heroui-native'
import { memo } from 'react'
import { Text, View } from 'react-native'

const statusConfig: Record<PremiseStatus, { dotClass: string }> = {
    draft: { dotClass: PREMISE_STATUS_CONFIG.draft.dotClass },
    rework: { dotClass: PREMISE_STATUS_CONFIG.rework.dotClass },
    archived: { dotClass: PREMISE_STATUS_CONFIG.archived.dotClass },
    ready: { dotClass: PREMISE_STATUS_CONFIG.ready.dotClass },
}

interface PremiseCardProps {
    premise: Premise
    onPress?: () => void
    onDelete?: () => void
}

function PremiseCardComponent({ premise, onPress, onDelete }: PremiseCardProps) {
    const { t } = useI18n()
    const status = statusConfig[premise.status]
    const bitCount = premise.bitIds?.length ?? 0
    const hasTags = premise.tags && premise.tags.length > 0

    return (
        <MaterialCard accentColor="bg-accent" onPress={onPress} onDelete={onDelete}>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className={`size-2 rounded-full ${status.dotClass}`} />
                    <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                        {getPremiseStatusLabel(t, premise.status, true)}
                    </Text>
                </View>
                <Text className="text-muted text-[11px]">
                    {timeAgo(premise.updatedAt)}
                </Text>
            </View>

            <Text className="text-foreground text-[17px] font-medium leading-6">
                {premise.content}
            </Text>

            {premise.attitude && (
                <Text className="text-muted text-sm">
                    {`${attitudeConfig[premise.attitude].emoji} ${getAttitudeLabel(t, premise.attitude)}`}
                </Text>
            )}

            {(hasTags || bitCount > 0) && (
                <View className="flex-row items-center justify-between pt-1 border-t border-separator">
                    <View className="flex-row flex-wrap gap-1.5 flex-1">
                        {premise.tags?.map((tag) => (
                            <Chip key={tag.id} size="sm" variant="tertiary" color="default">
                                <Chip.Label className="text-[11px]">#{tag.name}</Chip.Label>
                            </Chip>
                        ))}
                    </View>
                    {bitCount > 0 && (
                        <View className="flex-row items-center gap-1 ml-3">
                            <Icon name="reader-outline" size={13} className="text-muted" />
                            <Text className="text-muted text-xs font-medium">
                                {bitCount}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </MaterialCard>
    )
}

export const PremiseCard = memo(PremiseCardComponent)
