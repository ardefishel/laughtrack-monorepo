import { SelectBitsRow } from '@/components/feature/material/select-bits-row'
import { Icon } from '@/components/ui/ion-icon'
import { useObservedBits } from '@/hooks/use-observed-bits'
import type { Bit } from '@/types'
import { FlashList } from '@shopify/flash-list'
import { Button, Input, Separator } from 'heroui-native'
import { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View, type ViewStyle } from 'react-native'

const ITEM_SEPARATOR_STYLE: ViewStyle = { height: 8 }
const LIST_CONTENT_CONTAINER_STYLE: ViewStyle = { paddingHorizontal: 16, paddingBottom: 32 }
const PREMISE_LIST_HEADER_STYLE: ViewStyle = { paddingBottom: 8 }

type SelectBitsModalProps = {
    variant: 'setlist' | 'premise'
    premiseId?: string
    initialSelectedIds: string[]
    title: string
    searchPlaceholder: string
    createLabel: string
    confirmLabel: (count: number) => string
    isConfirmDisabled?: (count: number) => boolean
    onCancel: () => void
    onCreate: () => void
    onConfirm: (selectedIds: Set<string>) => void
}

export function SelectBitsModal({
    variant,
    premiseId,
    initialSelectedIds,
    title,
    searchPlaceholder = 'Search bits...',
    createLabel,
    confirmLabel,
    isConfirmDisabled,
    onCancel,
    onCreate,
    onConfirm,
}: SelectBitsModalProps) {
    const bits = useObservedBits()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds))
    const [search, setSearch] = useState('')

    const filteredBits = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return bits
        return bits.filter((bit) => bit.content.toLowerCase().includes(q))
    }, [bits, search])

    const toggleBit = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const handleConfirm = useCallback(() => {
        onConfirm(selectedIds)
    }, [onConfirm, selectedIds])

    const keyExtractor = useCallback((item: Bit) => item.id, [])
    const itemSeparator = useCallback(() => <View style={ITEM_SEPARATOR_STYLE} />, [])

    const renderItem = useCallback(
        ({ item: bit }: { item: Bit }) => {
            const isSelected = selectedIds.has(bit.id)

            return (
                <SelectBitsRow
                    bit={bit}
                    isSelected={isSelected}
                    onToggle={() => toggleBit(bit.id)}
                    variant={variant}
                    premiseId={premiseId}
                />
            )
        },
        [premiseId, selectedIds, toggleBit, variant]
    )

    const listHeader = useMemo(
        () => (
            <Pressable
                onPress={onCreate}
                className='flex-row items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-accent/40 active:opacity-70'
            >
                <View className='size-8 rounded-lg bg-accent/10 items-center justify-center'>
                    <Icon name='add' size={18} className='text-accent' />
                </View>
                <Text className='text-accent font-semibold text-sm flex-1'>
                    {createLabel}
                </Text>
                <Icon name='chevron-forward' size={14} className='text-muted' />
            </Pressable>
        ),
        [createLabel, onCreate]
    )

    const listEmpty = useMemo(
        () => (
            <View className='items-center py-12 gap-2'>
                <Icon name='search-outline' size={28} className='text-muted' />
                <Text className='text-muted text-sm'>No bits match your search</Text>
            </View>
        ),
        []
    )

    const count = selectedIds.size
    const confirmDisabled = isConfirmDisabled ? isConfirmDisabled(count) : false
    const listHeaderStyleProps =
        variant === 'premise'
            ? { ListHeaderComponentStyle: PREMISE_LIST_HEADER_STYLE }
            : undefined

    return (
        <View style={{ flex: 1 }}>
            <View collapsable={false}>
                <View className='flex-row items-center justify-between px-4 pt-4 pb-3 bg-field'>
                    <Button variant='ghost' onPress={onCancel}>
                        <Button.Label>Cancel</Button.Label>
                    </Button>
                    <Text className='text-foreground text-lg font-semibold'>{title}</Text>
                    <Button variant='ghost' onPress={handleConfirm} isDisabled={confirmDisabled}>
                        <Button.Label className='text-accent font-semibold'>
                            {confirmLabel(count)}
                        </Button.Label>
                    </Button>
                </View>
                <Separator />
                <View className='px-4 pt-4 pb-2'>
                    <Input
                        value={search}
                        onChangeText={setSearch}
                        placeholder={searchPlaceholder}
                        returnKeyType='search'
                        clearButtonMode='while-editing'
                        autoCorrect={false}
                        autoCapitalize='none'
                    />
                </View>
            </View>

            <FlashList
                data={filteredBits}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode='on-drag'
                contentContainerStyle={LIST_CONTENT_CONTAINER_STYLE}
                ItemSeparatorComponent={itemSeparator}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={listEmpty}
                renderItem={renderItem}
                {...listHeaderStyleProps}
            />
        </View>
    )
}
