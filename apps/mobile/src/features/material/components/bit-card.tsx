import { Icon } from '@/components/ui/ion-icon'
import { bitContentToPreview } from '@/database/mappers/bitMapper'
import type { Bit, BitStatus } from '@/types'
import { timeAgo } from '@/utils/time-ago'
import { Card, Chip, PressableFeedback } from 'heroui-native'
import { memo, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

const statusConfig: Record<BitStatus, { label: string; dotClass: string }> = {
    draft: { label: 'DRAFT', dotClass: 'bg-muted' },
    rework: { label: 'REWORK', dotClass: 'bg-warning' },
    tested: { label: 'TESTED', dotClass: 'bg-blue-500' },
    final: { label: 'FINAL', dotClass: 'bg-success' },
    dead: { label: 'DEAD', dotClass: 'bg-danger' },
}

interface BitCardProps {
    bit: Bit
    onPress?: () => void
    onDelete?: () => void
}

function BitCardComponent({ bit, onPress, onDelete }: BitCardProps) {
    const status = statusConfig[bit.status]
    const hasTags = bit.tags && bit.tags.length > 0
    const hasPremise = !!bit.premiseId
    const swipeableRef = useRef<Swipeable>(null)
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

    if (!onDelete) return card

    const renderRightActions = (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp',
        })

        return (
            <Pressable
                onPress={() => {
                    swipeableRef.current?.close()
                    onDelete()
                }}
                className="bg-danger rounded-xl items-center justify-center ml-3"
                style={{ width: 72 }}
            >
                <Animated.View style={{ transform: [{ scale }] }} className="items-center gap-1">
                    <Icon name="trash-outline" size={20} className="text-white" />
                    <Text className="text-white text-[10px] font-semibold">Delete</Text>
                </Animated.View>
            </Pressable>
        )
    }

    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
            {card}
        </Swipeable>
    )
}

export const BitCard = memo(BitCardComponent)
