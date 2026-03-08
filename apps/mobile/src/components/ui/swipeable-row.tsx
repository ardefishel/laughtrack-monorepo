import { Icon, type IconName } from '@/components/ui/ion-icon'
import { memo, useCallback, useRef } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

export interface SwipeAction {
    key: string
    icon: IconName
    label: string
    color: string
    onPress: () => void
}

interface SwipeableRowProps {
    actions: SwipeAction[]
    children: React.ReactNode
}

function SwipeableRowComponent({ actions, children }: SwipeableRowProps) {
    const swipeableRef = useRef<Swipeable>(null)

    const renderRightActions = useCallback(
        (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
            const scale = dragX.interpolate({
                inputRange: [-(80 * actions.length), 0],
                outputRange: [1, 0.5],
                extrapolate: 'clamp',
            })

            return (
                <>
                    {actions.map((action) => (
                        <Pressable
                            key={action.key}
                            onPress={() => {
                                swipeableRef.current?.close()
                                action.onPress()
                            }}
                            className={`${action.color} rounded-xl items-center justify-center ml-3`}
                            style={{ width: 72 }}
                        >
                            <Animated.View style={{ transform: [{ scale }] }} className="items-center gap-1">
                                <Icon name={action.icon} size={20} className="text-white" />
                                <Text className="text-white text-[10px] font-semibold">{action.label}</Text>
                            </Animated.View>
                        </Pressable>
                    ))}
                </>
            )
        },
        [actions],
    )

    if (actions.length === 0) return <>{children}</>

    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
            <>{children}</>
        </Swipeable>
    )
}

export const SwipeableRow = memo(SwipeableRowComponent)
