import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import type { Attitude } from '@/types'
import { Button, PressableFeedback, Separator } from 'heroui-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text, View } from 'react-native'

const ATTITUDE_OPTIONS = Object.entries(attitudeConfig) as [Attitude, { label: string; emoji: string }][]

export default function PremiseAttitudeModal() {
    const router = useRouter()
    const params = useLocalSearchParams<{ premiseId?: string; selectedAttitude?: string }>()
    const selectedAttitude = params.selectedAttitude as Attitude | undefined

    const handleSelect = (attitude?: Attitude) => {
        router.dismissTo({
            pathname: '/(app)/(detail)/premise/[id]',
            params: {
                id: params.premiseId ?? 'new',
                selectedAttitude: attitude ?? '',
                attitudeNonce: Date.now().toString(),
            },
        })
    }

    return (
        <View style={{ flex: 1 }}>
            <View className='flex-row items-center justify-between px-4 pt-4 pb-3 bg-field'>
                <Button variant='ghost' onPress={() => router.back()}>
                    <Button.Label>Cancel</Button.Label>
                </Button>
                <Text className='text-foreground text-lg font-semibold'>Premise Attitude</Text>
                <View className='w-16' />
            </View>
            <Separator />

            <View className='flex-1 px-6 pt-6 gap-1'>
                <PressableFeedback
                    onPress={() => handleSelect(undefined)}
                    accessibilityRole='button'
                    accessibilityLabel='Clear premise attitude'
                    accessibilityState={{ selected: !selectedAttitude }}
                    className='flex-row items-center gap-3 rounded-xl px-4 py-4'
                >
                    <Icon name='close-circle' size={18} className='text-muted' />
                    <Text className='text-foreground flex-1 text-base'>None</Text>
                    {!selectedAttitude ? <Icon name='checkmark' size={20} className='text-accent' /> : null}
                </PressableFeedback>

                {ATTITUDE_OPTIONS.map(([value, config]) => {
                    const isSelected = value === selectedAttitude

                    return (
                        <PressableFeedback
                            key={value}
                            onPress={() => handleSelect(value)}
                            accessibilityRole='button'
                            accessibilityLabel={`Set premise attitude to ${config.label}`}
                            accessibilityState={{ selected: isSelected }}
                            className='flex-row items-center gap-3 rounded-xl px-4 py-4'
                        >
                            <Text className='text-base'>{config.emoji}</Text>
                            <Text className='text-foreground flex-1 text-base'>{config.label}</Text>
                            {isSelected ? <Icon name='checkmark' size={20} className='text-accent' /> : null}
                        </PressableFeedback>
                    )
                })}
            </View>
        </View>
    )
}
