/**
 * DraggableList — A drop-in replacement for react-native-draggable-flatlist
 * built on react-native-gesture-handler + react-native-reanimated.
 *
 * Uses FlashList for rendering and supports long-press to drag,
 * animated reordering, and haptic feedback.
 */

import { FlashList, type ListRenderItem } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo, useRef, useState } from 'react'
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DraggableRenderItemParams<T> = {
    item: T
    getIndex: () => number
    drag: () => void
    isActive: boolean
}

export type DraggableListProps<T> = {
    data: T[]
    keyExtractor: (item: T, index: number) => string
    renderItem: (params: DraggableRenderItemParams<T>) => React.ReactElement | null
    onDragBegin?: () => void
    onDragEnd?: (params: { data: T[] }) => void

    ListHeaderComponent?: React.ComponentType | React.ReactElement | null
    ListFooterComponent?: React.ComponentType | React.ReactElement | null
    ListEmptyComponent?: React.ComponentType | React.ReactElement | null
    ItemSeparatorComponent?: React.ComponentType | null
    contentContainerStyle?: ViewStyle
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPRING_CONFIG = { damping: 20, stiffness: 200 }
const ACTIVE_SCALE = 1.03
const LONG_PRESS_DURATION = 300

// ─── DraggableRow Wrapper ─────────────────────────────────────────────────────

function DraggableRow<T>({
    item,
    index,
    renderItem,
    isActive,
    onDragStart,
    onDragUpdate,
    onDragEnd,
    rowHeights,
}: {
    item: T
    index: number
    renderItem: (params: DraggableRenderItemParams<T>) => React.ReactElement | null
    isActive: boolean
    onDragStart: (index: number) => void
    onDragUpdate: (index: number, translationY: number) => void
    onDragEnd: (index: number) => void
    rowHeights: React.MutableRefObject<Map<number, number>>
}) {
    const translateY = useSharedValue(0)
    const scale = useSharedValue(1)
    const zIndex = useSharedValue(0)
    const isDragging = useSharedValue(false)

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            rowHeights.current.set(index, e.nativeEvent.layout.height)
        },
        [index, rowHeights],
    )

    const longPressGesture = Gesture.LongPress()
        .minDuration(LONG_PRESS_DURATION)
        .onStart(() => {
            'worklet'
            isDragging.value = true
            scale.value = withSpring(ACTIVE_SCALE, SPRING_CONFIG)
            zIndex.value = 100
            runOnJS(onDragStart)(index)
        })

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((_e, stateManager) => {
            'worklet'
            if (isDragging.value) {
                stateManager.activate()
            } else {
                stateManager.fail()
            }
        })
        .onUpdate((e) => {
            'worklet'
            translateY.value = e.translationY
            runOnJS(onDragUpdate)(index, e.translationY)
        })
        .onEnd(() => {
            'worklet'
            isDragging.value = false
            translateY.value = withSpring(0, SPRING_CONFIG)
            scale.value = withSpring(1, SPRING_CONFIG)
            zIndex.value = 0
            runOnJS(onDragEnd)(index)
        })
        .onFinalize(() => {
            'worklet'
            isDragging.value = false
            translateY.value = withSpring(0, SPRING_CONFIG)
            scale.value = withSpring(1, SPRING_CONFIG)
            zIndex.value = 0
        })

    const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        zIndex: zIndex.value,
        elevation: zIndex.value > 0 ? 8 : 0,
    }))

    const getIndex = useCallback(() => index, [index])
    const drag = useCallback(() => { }, [])

    const content = useMemo(
        () => renderItem({ item, getIndex, drag, isActive }),
        [item, getIndex, drag, isActive, renderItem],
    )

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={isActive ? animatedStyle : undefined} onLayout={onLayout}>
                {content}
            </Animated.View>
        </GestureDetector>
    )
}

// ─── Main DraggableList Component ─────────────────────────────────────────────

export function DraggableList<T>({
    data: externalData,
    keyExtractor,
    renderItem,
    onDragBegin,
    onDragEnd,

    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    ItemSeparatorComponent,
    contentContainerStyle,
    keyboardShouldPersistTaps,
}: DraggableListProps<T>) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [orderedData, setOrderedData] = useState<T[]>(externalData)
    const rowHeights = useRef<Map<number, number>>(new Map())
    const dragStartIndex = useRef<number | null>(null)

    // Keep orderedData in sync with external data when not dragging
    const prevExternalRef = useRef(externalData)
    if (externalData !== prevExternalRef.current && activeIndex === null) {
        prevExternalRef.current = externalData
        setOrderedData(externalData)
    }

    const getAverageRowHeight = useCallback(() => {
        const heights = Array.from(rowHeights.current.values())
        if (heights.length === 0) return 72
        return heights.reduce((sum, h) => sum + h, 0) / heights.length
    }, [])

    const handleDragStart = useCallback(
        (index: number) => {
            setActiveIndex(index)
            dragStartIndex.current = index
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            onDragBegin?.()
        },
        [onDragBegin],
    )

    const handleDragUpdate = useCallback(
        (fromIndex: number, translationY: number) => {
            if (dragStartIndex.current === null) return

            const avgHeight = getAverageRowHeight()
            const displacement = Math.round(translationY / avgHeight)
            const newIndex = Math.max(
                0,
                Math.min(orderedData.length - 1, dragStartIndex.current + displacement),
            )

            if (newIndex !== fromIndex && newIndex >= 0 && newIndex < orderedData.length) {
                setOrderedData((prev) => {
                    const copy = [...prev]
                    const [movedItem] = copy.splice(fromIndex, 1)
                    copy.splice(newIndex, 0, movedItem)
                    return copy
                })
                setActiveIndex(newIndex)
                dragStartIndex.current = newIndex
                Haptics.selectionAsync()
            }
        },
        [orderedData.length, getAverageRowHeight],
    )

    const handleDragEnd = useCallback(
        (_index: number) => {
            setActiveIndex(null)
            dragStartIndex.current = null
            onDragEnd?.({ data: orderedData })
        },
        [onDragEnd, orderedData],
    )

    const internalRenderItem: ListRenderItem<T> = useCallback(
        ({ item, index }) => (
            <DraggableRow
                item={item}
                index={index}
                renderItem={renderItem}
                isActive={activeIndex === index}
                onDragStart={handleDragStart}
                onDragUpdate={handleDragUpdate}
                onDragEnd={handleDragEnd}
                rowHeights={rowHeights}
            />
        ),
        [renderItem, activeIndex, handleDragStart, handleDragUpdate, handleDragEnd],
    )

    return (
        <View style={{ flex: 1 }}>
            <FlashList
                data={orderedData}
                keyExtractor={keyExtractor}

                renderItem={internalRenderItem}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}
                ItemSeparatorComponent={ItemSeparatorComponent}
                contentContainerStyle={contentContainerStyle}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                scrollEnabled={activeIndex === null}
                extraData={activeIndex}
            />
        </View>
    )
}

export default DraggableList
