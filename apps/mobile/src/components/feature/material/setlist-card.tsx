import { Icon } from '@/components/ui/ion-icon'
import type { Setlist } from '@/types'
import { timeAgo } from '@/utils/time-ago'
import { Card, Chip, PressableFeedback } from 'heroui-native'
import { memo, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

interface SetlistCardProps {
    setlist: Setlist
    onPress?: () => void
    onDelete?: () => void
}

function SetlistCardComponent({ setlist, onPress, onDelete }: SetlistCardProps) {
    const bitCount = setlist.items.filter((item) => item.type === 'bit').length
    const hasTags = setlist.tags && setlist.tags.length > 0
    const swipeableRef = useRef<Swipeable>(null)

    const card = (
        <PressableFeedback onPress={onPress}>
            <Card className="flex-row overflow-hidden">
                <View className="w-1 bg-green-500 rounded-full" />
                <View className="flex-1 pl-4 gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Icon name="list-outline" size={13} className="text-muted" />
                            <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                                SETLIST
                            </Text>
                        </View>
                        <Text className="text-muted text-[11px]">
                            {timeAgo(setlist.updatedAt)}
                        </Text>
                    </View>

                    <Text
                        className="text-foreground text-[17px] font-medium leading-6"
                        numberOfLines={2}
                    >
                        {setlist.description || 'Untitled Setlist'}
                    </Text>

                    <View className="flex-row items-center justify-between pt-1 border-t border-separator">
                        <View className="flex-row flex-wrap gap-1.5 flex-1">
                            {hasTags
                                ? setlist.tags?.map((tag) => (
                                    <Chip key={tag.id} size="sm" variant="tertiary" color="default">
                                        <Chip.Label className="text-[11px]">#{tag.name}</Chip.Label>
                                    </Chip>
                                ))
                                : null}
                        </View>
                        <View className="flex-row items-center gap-3 ml-3">
                            {bitCount > 0 && (
                                <View className="flex-row items-center gap-1">
                                    <Icon name="reader-outline" size={13} className="text-muted" />
                                    <Text className="text-muted text-xs font-medium">{bitCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
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

export const SetlistCard = memo(SetlistCardComponent)
