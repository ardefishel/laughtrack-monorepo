import { Icon } from '@/components/ui/ion-icon'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import * as Haptics from 'expo-haptics'
import { Card } from 'heroui-native'
import { memo, useCallback } from 'react'
import { Pressable, View } from 'react-native'
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
    const handleDrag = useCallback(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        drag()
    }, [drag])

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

    return (
        <ScaleDecorator>
            <View className="mx-4">
                <SwipeableRow
                    actions={onDelete ? [{ key: 'delete', icon: 'trash-outline', label: 'Delete', color: 'bg-danger', onPress: onDelete }] : []}
                >
                    {card}
                </SwipeableRow>
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
