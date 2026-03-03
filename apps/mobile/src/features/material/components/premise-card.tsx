import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import type { Premise, PremiseStatus } from '@/types'
import { timeAgo } from '@/utils/time-ago'
import { Card, Chip, PressableFeedback } from 'heroui-native'
import { memo, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

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
    const swipeableRef = useRef<Swipeable>(null)

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

export const PremiseCard = memo(PremiseCardComponent)
