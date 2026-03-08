import { Icon } from '@/components/ui/ion-icon'
import { PREMISE_STATUS_OPTIONS } from '@/config/premise-statuses'
import type { PremiseStatus } from '@/types'
import { Button, PressableFeedback, Separator } from 'heroui-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text, View } from 'react-native'

export default function PremiseStatusModal() {
    const router = useRouter()
    const params = useLocalSearchParams<{ premiseId?: string; selectedStatus?: string }>()
    const selectedStatus = (params.selectedStatus as PremiseStatus | undefined) ?? 'draft'

    const handleSelect = (status: PremiseStatus) => {
        router.dismissTo({
            pathname: '/(app)/(detail)/premise/[id]',
            params: {
                id: params.premiseId ?? 'new',
                selectedStatus: status,
                statusNonce: Date.now().toString(),
            },
        })
    }

    return (
        <View style={{ flex: 1 }}>
            <View className='flex-row items-center justify-between px-4 pt-4 pb-3 bg-field'>
                <Button variant='ghost' onPress={() => router.back()}>
                    <Button.Label>Cancel</Button.Label>
                </Button>
                <Text className='text-foreground text-lg font-semibold'>Premise Status</Text>
                <View className='w-16' />
            </View>
            <Separator />

            <View className='flex-1 px-6 pt-6 gap-1'>
                {PREMISE_STATUS_OPTIONS.map((option) => {
                    const isSelected = option.value === selectedStatus

                    return (
                        <PressableFeedback
                            key={option.value}
                            onPress={() => handleSelect(option.value)}
                            accessibilityRole='button'
                            accessibilityLabel={`Set premise status to ${option.label}`}
                            accessibilityState={{ selected: isSelected }}
                            className='flex-row items-center gap-3 rounded-xl px-4 py-4'
                        >
                            <View className={`size-2.5 rounded-full ${option.dotClass}`} />
                            <Text className='text-foreground flex-1 text-base'>{option.label}</Text>
                            {isSelected ? <Icon name='checkmark' size={20} className='text-accent' /> : null}
                        </PressableFeedback>
                    )
                })}
            </View>
        </View>
    )
}
