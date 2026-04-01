import { Icon } from '@/components/ui/ion-icon'
import { getPremiseStatusOptions } from '@/config/premise-statuses'
import { useI18n } from '@/i18n'
import type { PremiseStatus } from '@/types'
import { Button, PressableFeedback, Separator } from 'heroui-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text, View } from 'react-native'

export default function PremiseStatusModal() {
    const router = useRouter()
    const { t } = useI18n()
    const params = useLocalSearchParams<{ premiseId?: string; selectedStatus?: string }>()
    const selectedStatus = (params.selectedStatus as PremiseStatus | undefined) ?? 'draft'
    const premiseStatusOptions = getPremiseStatusOptions(t)

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
                <Button variant='ghost' onPress={() => router.back()} accessibilityLabel={t('bitMeta.cancel')}>
                    <Button.Label>{t('bitMeta.cancel')}</Button.Label>
                </Button>
                <Text className='text-foreground text-lg font-semibold'>{t('premise.statusModal.title')}</Text>
                <View className='w-16' />
            </View>
            <Separator />

            <View className='flex-1 px-6 pt-6 gap-1'>
                {premiseStatusOptions.map((option) => {
                    const isSelected = option.value === selectedStatus

                    return (
                        <PressableFeedback
                            key={option.value}
                            onPress={() => handleSelect(option.value)}
                            accessibilityRole='button'
                            accessibilityLabel={t('premise.statusModal.accessibilityLabel', { status: option.label })}
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
