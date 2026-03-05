import { Icon } from '@/components/ui/ion-icon'
import type { Bit } from '@/types'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'

const BIT_STATUS_DOT: Record<string, string> = {
    draft: 'bg-muted',
    rework: 'bg-warning',
    tested: 'bg-blue-500',
    final: 'bg-success',
    dead: 'bg-danger',
}

type SelectBitsRowProps = {
    bit: Bit
    isSelected: boolean
    onToggle: () => void
    variant: 'setlist' | 'premise'
    premiseId?: string
}

function SelectBitsRowComponent({ bit, isSelected, onToggle, variant, premiseId }: SelectBitsRowProps) {
    const dotClass = BIT_STATUS_DOT[bit.status] ?? 'bg-muted'
    const isLinkedHere = premiseId ? bit.premiseId === premiseId : false
    const isLinkedElsewhere = !!bit.premiseId && !isLinkedHere

    if (variant === 'premise') {
        return (
            <Pressable
                onPress={onToggle}
                className={`gap-2 p-4 rounded-xl border active:opacity-70 ${isSelected
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-separator'
                    }`}
            >
                <View className='flex-row items-start gap-3'>
                    <View
                        className={`size-5 rounded-full border-2 mt-0.5 items-center justify-center shrink-0 ${isSelected ? 'bg-accent border-accent' : 'border-separator'}`}
                    >
                        {isSelected && <Icon name='checkmark' size={12} className='text-white' />}
                    </View>

                    <View className='flex-1 gap-1.5'>
                        <View className='flex-row items-center gap-1.5'>
                            <View className={`size-2 rounded-full ${dotClass}`} />
                            <Text className='text-muted text-[10px] tracking-[2px] font-semibold uppercase'>
                                {bit.status}
                            </Text>
                        </View>
                        <Text className='text-foreground text-sm leading-5' numberOfLines={3}>
                            {bit.content}
                        </Text>
                    </View>
                </View>

                {isLinkedHere && (
                    <View className='self-start rounded-full px-2 py-0.5 bg-success/10'>
                        <Text className='text-success text-[10px] font-semibold'>Linked here</Text>
                    </View>
                )}
                {isLinkedElsewhere && (
                    <View className='self-start rounded-full px-2 py-0.5 bg-warning/15'>
                        <Text className='text-warning text-[10px] font-semibold'>Linked to another premise</Text>
                    </View>
                )}
            </Pressable>
        )
    }

    return (
        <Pressable
            onPress={onToggle}
            className={`flex-row items-start gap-3 p-4 rounded-xl border active:opacity-70 ${isSelected
                ? 'bg-accent/10 border-accent'
                : 'bg-surface border-separator'
                }`}
        >
            <View
                className={`size-5 rounded-full border-2 mt-0.5 items-center justify-center shrink-0 ${isSelected ? 'bg-accent border-accent' : 'border-separator'
                    }`}
            >
                {isSelected && (
                    <Icon name='checkmark' size={12} className='text-white' />
                )}
            </View>

            <View className='flex-1 gap-1.5'>
                <View className='flex-row items-center gap-1.5'>
                    <View className={`size-2 rounded-full ${dotClass}`} />
                    <Text className='text-muted text-[10px] tracking-[2px] font-semibold uppercase'>
                        {bit.status}
                    </Text>
                </View>
                <Text
                    className='text-foreground text-sm leading-5'
                    numberOfLines={3}
                >
                    {bit.content}
                </Text>
            </View>
        </Pressable>
    )
}

export const SelectBitsRow = memo(SelectBitsRowComponent)
