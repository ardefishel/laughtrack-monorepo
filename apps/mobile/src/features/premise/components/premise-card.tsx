import { Icon } from '@/components/ui/ion-icon'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { attitudeConfig } from '@/config/attitudes'
import type { Premise, PremiseStatus } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Card, Chip, PressableFeedback } from 'heroui-native'
import { memo } from 'react'
import { Text, View } from 'react-native'

const statusConfig: Record<PremiseStatus, { label: string; dotClass: string }> = {
    draft: { label: 'DRAFT', dotClass: 'bg-muted' },
    rework: { label: 'REWORK', dotClass: 'bg-warning' },
    archived: { label: 'ARCHIVED', dotClass: 'bg-default' },
    ready: { label: 'READY', dotClass: 'bg-success' },
}

interface PremiseCardProps {
    premise: Premise
    onPress?: () => void
    onDelete?: () => void
}

function PremiseCardComponent({ premise, onPress, onDelete }: PremiseCardProps) {
    const status = statusConfig[premise.status]
    const bitCount = premise.bitIds?.length ?? 0
    const hasTags = premise.tags && premise.tags.length > 0

    const card = (
        <PressableFeedback onPress={onPress}>
            <Card className="flex-row overflow-hidden">
                <View className="w-1 bg-accent rounded-full" />
                <View className="flex-1 pl-4 gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <View className={`size-2 rounded-full ${status.dotClass}`} />
                            <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                                {status.label}
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
                            {`${attitudeConfig[premise.attitude].emoji} ${attitudeConfig[premise.attitude].label}`}
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
                </View>
            </Card>
        </PressableFeedback>
    )

    return (
        <SwipeableRow
            actions={onDelete ? [{ key: 'delete', icon: 'trash-outline', label: 'Delete', color: 'bg-danger', onPress: onDelete }] : []}
        >
            {card}
        </SwipeableRow>
    )
}

export const PremiseCard = memo(PremiseCardComponent)
