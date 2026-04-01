import { Icon } from '@/components/ui/ion-icon'
import { getAttitudeOptions } from '@/config/attitudes'
import { useI18n } from '@/i18n'
import type { Attitude } from '@/types'
import { Button, PressableFeedback, Separator } from 'heroui-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text, View } from 'react-native'

export default function PremiseAttitudeModal() {
    const router = useRouter()
    const { t } = useI18n()
    const params = useLocalSearchParams<{ premiseId?: string; selectedAttitude?: string }>()
    const selectedAttitude = params.selectedAttitude as Attitude | undefined
    const attitudeOptions = getAttitudeOptions(t)

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
                <Button variant='ghost' onPress={() => router.back()} accessibilityLabel={t('bitMeta.cancel')}>
                    <Button.Label>{t('bitMeta.cancel')}</Button.Label>
                </Button>
                <Text className='text-foreground text-lg font-semibold'>{t('premise.attitudeModal.title')}</Text>
                <View className='w-16' />
            </View>
            <Separator />

            <View className='flex-1 px-6 pt-6 gap-1'>
                <PressableFeedback
                    onPress={() => handleSelect(undefined)}
                    accessibilityRole='button'
                    accessibilityLabel={t('premise.detail.clearAttitude')}
                    accessibilityState={{ selected: !selectedAttitude }}
                    className='flex-row items-center gap-3 rounded-xl px-4 py-4'
                >
                    <Icon name='close-circle' size={18} className='text-muted' />
                    <Text className='text-foreground flex-1 text-base'>{t('common.none')}</Text>
                    {!selectedAttitude ? <Icon name='checkmark' size={20} className='text-accent' /> : null}
                </PressableFeedback>

                {attitudeOptions.map(([value, config]) => {
                    const isSelected = value === selectedAttitude

                    return (
                        <PressableFeedback
                            key={value}
                            onPress={() => handleSelect(value)}
                            accessibilityRole='button'
                            accessibilityLabel={t('premise.attitudeModal.accessibilityLabel', { attitude: config.label })}
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
