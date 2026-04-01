import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import type { SupportedLocale } from '@/i18n/config'
import { Button, PressableFeedback, Separator } from 'heroui-native'
import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

const LANGUAGE_OPTIONS: { value: SupportedLocale; labelKey: 'account.language.english' | 'account.language.indonesian' }[] = [
  { value: 'en', labelKey: 'account.language.english' },
  { value: 'id', labelKey: 'account.language.indonesian' },
]

export default function LanguageSelectModal() {
  const router = useRouter()
  const { locale, setLocale, t } = useI18n()

  const handleSelect = (nextLocale: SupportedLocale) => {
    if (nextLocale !== locale) {
      setLocale(nextLocale)
    }

    router.back()
  }

  return (
    <View style={{ flex: 1 }}>
      <View className='flex-row items-center justify-between px-4 pt-4 pb-3 bg-field'>
        <Button variant='ghost' onPress={() => router.back()} accessibilityLabel={t('bitMeta.cancel')}>
          <Button.Label>{t('bitMeta.cancel')}</Button.Label>
        </Button>
        <Text className='text-foreground text-lg font-semibold'>{t('account.language.setting')}</Text>
        <View className='w-16' />
      </View>
      <Separator />

      <View className='flex-1 px-6 pt-6 gap-4'>
        <Text className='text-sm text-muted'>{t('account.language.description')}</Text>
        <View className='gap-1'>
          {LANGUAGE_OPTIONS.map((option) => {
            const label = t(option.labelKey)
            const isSelected = option.value === locale

            return (
              <PressableFeedback
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole='button'
                accessibilityLabel={label}
                accessibilityState={{ selected: isSelected }}
                className='flex-row items-center rounded-xl px-4 py-4'
              >
                <Text className='text-foreground flex-1 text-base'>{label}</Text>
                {isSelected ? <Icon name='checkmark' size={20} className='text-accent' /> : null}
              </PressableFeedback>
            )
          })}
        </View>
      </View>
    </View>
  )
}
