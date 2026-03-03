import { Icon } from '@/components/ui/ion-icon'
import * as Haptics from 'expo-haptics'
import { Card } from 'heroui-native'
import { memo, useCallback, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import DraggableFlatList, {
    type DragEndParams,
    type RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist'

export interface DraggableListItem {
    id: string
    [key: string]: unknown
}

export interface DraggableListProps<T extends DraggableListItem> {
    data: T[]
    onDragEnd: (data: T[]) => void
    onDelete?: (item: T) => void
    renderItemContent: (item: T, index: number | undefined) => React.ReactNode
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface DraggableRowProps {
    isActive: boolean
    drag: () => void
    onDelete?: () => void
    children: React.ReactNode
}

function DraggableRowComponent({ isActive, drag, onDelete, children }: DraggableRowProps) {
    const swipeableRef = useRef<Swipeable>(null)

    const handleDrag = useCallback(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        drag()
    }, [drag])

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
                    onDelete?.()
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

    const card = (
        <Card className={`flex-row overflow-hidden ${isActive ? 'opacity-95' : ''}`}>
            <View className="justify-center pl-2">
                <View className={`w-1 h-8 rounded-full ${isActive ? 'bg-accent' : 'bg-accent/40'}`} />
            </View>
            <View className="flex-1 flex-row items-center gap-2 pl-3 pr-2 py-3">
                <View className="flex-1">{children}</View>

                <Pressable
                    onLongPress={handleDrag}
                    delayLongPress={150}
                    disabled={isActive}
                    className={`items-center justify-center w-5 h-5 ${isActive ? 'opacity-45' : 'opacity-80 active:opacity-60'}`}
                    accessibilityRole="button"
                    accessibilityLabel="Drag to reorder"
                    accessibilityState={{ disabled: isActive }}
                    hitSlop={14}
                >
                    <Icon name="reorder-three-outline" size={14} className="text-muted" />
                </Pressable>
            </View>
        </Card>
    )

    if (!onDelete) {
        return (
            <ScaleDecorator>
                <View className="mx-4">{card}</View>
            </ScaleDecorator>
        )
    }

    return (
        <ScaleDecorator>
            <View className="mx-4">
                <Swipeable
                    ref={swipeableRef}
                    renderRightActions={renderRightActions}
                    overshootRight={false}
                    friction={2}
                >
                    {card}
                </Swipeable>
            </View>
        </ScaleDecorator>
    )
}

const DraggableRow = memo(DraggableRowComponent)

// ── Separator ─────────────────────────────────────────────────────────────────

function ItemSeparator() {
    return <View className="h-2.5" />
}

// ── List ──────────────────────────────────────────────────────────────────────

export default function DraggableList<T extends DraggableListItem>({
    data,
    onDragEnd,
    onDelete,
    renderItemContent,
}: DraggableListProps<T>) {
    const handleDragEnd = useCallback(
        ({ data: reordered }: DragEndParams<T>) => {
            onDragEnd(reordered)
        },
        [onDragEnd],
    )

    const renderItem = useCallback(
        ({ item, drag, isActive, getIndex }: RenderItemParams<T>) => {
            const index = getIndex()
            return (
                <DraggableRow
                    isActive={isActive}
                    drag={drag}
                    onDelete={onDelete ? () => onDelete(item) : undefined}
                >
                    {renderItemContent(item, index)}
                </DraggableRow>
            )
        },
        [renderItemContent, onDelete],
    )

    const keyExtractor = useCallback((item: T) => item.id, [])

    return (
        <DraggableFlatList
            data={data}
            onDragEnd={handleDragEnd}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
        />
    )
}
