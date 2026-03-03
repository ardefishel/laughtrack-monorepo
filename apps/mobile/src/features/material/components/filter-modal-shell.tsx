import { Button, Separator } from 'heroui-native'
import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'

type FilterModalShellProps = {
    title?: string
    activeCount: number
    onClear: () => void
    onApply: () => void
    children: ReactNode
    scroll?: boolean
    applyPrefix?: ReactNode
}

export function FilterModalShell({
    title = 'Filters',
    activeCount,
    onClear,
    onApply,
    children,
    scroll = false,
    applyPrefix,
}: FilterModalShellProps) {
    const content = scroll ? (
        <ScrollView contentContainerClassName='px-6 pt-6 gap-4 pb-8'>{children}</ScrollView>
    ) : (
        <View className='flex-1 px-6 pt-6 gap-4'>{children}</View>
    )

    return (
        <View style={{ flex: 1 }}>
            <View className='flex-row items-center justify-between px-4 pt-4 pb-3 bg-field'>
                <Button variant='ghost' onPress={() => router.back()}>
                    <Button.Label>Cancel</Button.Label>
                </Button>

                <Text className='text-foreground text-lg font-semibold'>{title}</Text>

                <Button variant='ghost' onPress={onClear} isDisabled={activeCount === 0}>
                    <Button.Label>Reset</Button.Label>
                </Button>
            </View>

            <Separator />

            {content}

            <View className='px-6 pb-6'>
                <Button variant='primary' className='mt-4' onPress={onApply}>
                    {applyPrefix}
                    <Button.Label>{activeCount > 0 ? `Apply Filters (${activeCount})` : 'Apply Filters'}</Button.Label>
                </Button>
            </View>
        </View>
    )
}
