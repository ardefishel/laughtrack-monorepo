import { Icon } from '@/components/ui/ion-icon'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { BIT_STATUS_OPTIONS } from '@/config/bit-statuses'
import { bitContentToPreview } from '@/database/mappers/bitMapper'
import type { Bit, BitStatus } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Card, Chip, PressableFeedback } from 'heroui-native'
import { memo } from 'react'
import { Text, View } from 'react-native'

const statusConfig = Object.fromEntries(
    BIT_STATUS_OPTIONS.map((opt) => [opt.value, { label: opt.label.toUpperCase(), dotClass: opt.dotClass }])
) as Record<BitStatus, { label: string; dotClass: string }>

interface BitCardProps {
    bit: Bit
    onPress?: () => void
    onDelete?: () => void
}

function BitCardComponent({ bit, onPress, onDelete }: BitCardProps) {
    const status = statusConfig[bit.status]
    const hasTags = bit.tags && bit.tags.length > 0
    const hasPremise = !!bit.premiseId
    const preview = bitContentToPreview(bit.content)

    const card = (
        <PressableFeedback onPress={onPress}>
            <Card className="flex-row overflow-hidden">
                <View className="w-1 bg-blue-500 rounded-full" />
                <View className="flex-1 pl-4 gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <View className={`size-2 rounded-full ${status.dotClass}`} />
                            <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                                {status.label}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            {hasPremise && (
                                <Icon name="bulb-outline" size={13} className="text-muted" />
                            )}
                            <Text className="text-muted text-[11px]">
                                {timeAgo(bit.updatedAt)}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-foreground text-[17px] font-medium leading-6" numberOfLines={1}>
                        {preview.title || 'Untitled bit'}
                    </Text>

                    {preview.description ? (
                        <Text className="text-muted text-[14px] leading-5" numberOfLines={2}>
                            {preview.description}
                        </Text>
                    ) : null}

                    {hasTags && (
                        <View className="flex-row flex-wrap gap-1.5 pt-1">
                            {bit.tags?.map((tag) => (
                                <Chip key={tag.id} size="sm" variant="tertiary" color="default">
                                    <Chip.Label className="text-[11px]">#{tag.name}</Chip.Label>
                                </Chip>
                            ))}
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

export const BitCard = memo(BitCardComponent)
