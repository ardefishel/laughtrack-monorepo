import { Icon } from '@/components/ui/ion-icon'
import { useKeyboardOffset } from '@/lib/use-keyboard-offset'
import { FlashList, type FlashListProps, type FlashListRef, type ListRenderItem } from '@shopify/flash-list'
import { Button, Input, useThemeColor } from 'heroui-native'
import type { RefObject } from 'react'
import { useCallback, useMemo } from 'react'
import { View, type ViewStyle } from 'react-native'

const ITEM_SEPARATOR_STYLE: ViewStyle = { height: 12 }

interface MaterialListScreenProps<ItemT> {
    data: readonly ItemT[]
    renderItem: ListRenderItem<ItemT>
    keyExtractor: NonNullable<FlashListProps<ItemT>['keyExtractor']>
    hasActiveFilters: boolean
    onFilterPress: () => void
    onFabPress: () => void
    fabLabel: string
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    listRef?: RefObject<FlashListRef<ItemT> | null>
}

export function MaterialListScreen<ItemT>({
    data,
    renderItem,
    keyExtractor,
    hasActiveFilters,
    onFilterPress,
    onFabPress,
    fabLabel,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search',
    listRef,
}: MaterialListScreenProps<ItemT>) {
    const keyboardOffset = useKeyboardOffset()
    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')

    const contentContainerStyle = useMemo<ViewStyle>(() => ({
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 96,
    }), [])

    const fabStyle = useMemo<ViewStyle>(() => ({
        marginBottom: keyboardOffset + 20,
    }), [keyboardOffset])

    const itemSeparator = useCallback(() => <View style={ITEM_SEPARATOR_STYLE} />, [])

    return (
        <View className='flex-1'>
            <View className='flex-row mx-4 mt-4 pb-2 gap-4'>
                <Input
                    className='flex-1'
                    value={searchValue}
                    onChangeText={onSearchChange}
                    placeholder={searchPlaceholder}
                    returnKeyType='search'
                />
                <Button
                    isIconOnly
                    variant='outline'
                    onPress={onFilterPress}
                    className={hasActiveFilters ? 'bg-accent border-accent' : ''}
                >
                    <Icon
                        name='filter-outline'
                        size={20}
                        color={hasActiveFilters ? foreground : muted}
                    />
                </Button>
            </View>

            <FlashList
                ref={listRef}
                data={data}
                keyExtractor={keyExtractor}
                contentContainerStyle={contentContainerStyle}
                ItemSeparatorComponent={itemSeparator}
                renderItem={renderItem}
                estimatedItemSize={120}
            />

            <Button className='absolute right-0 bottom-0 mr-4' style={fabStyle} onPress={onFabPress}>
                <Icon name='add-outline' size={20} />
                <Button.Label>{fabLabel}</Button.Label>
            </Button>
        </View>
    )
}
