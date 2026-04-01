import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import { useRouter } from 'expo-router'
import { ListGroup } from 'heroui-native'
import { Text, View } from 'react-native'

export function LanguagePreferenceGroup() {
  const router = useRouter()
  const { locale, t } = useI18n()

  const currentLanguage = locale === 'id' ? t('account.language.indonesian') : t('account.language.english')

  return (
    <>
      <Text className="text-sm text-muted mb-2 ml-2">{t('account.language.title')}</Text>
      <ListGroup className="mb-6">
        <ListGroup.Item
          onPress={() => router.push('/(app)/(modal)/language-select')}
          accessibilityLabel={t('account.language.setting')}
          accessibilityHint={t('account.language.description')}
        >
          <ListGroup.ItemPrefix>
            <Icon name="language-outline" size={22} className="text-foreground" />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t('account.language.setting')}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted" numberOfLines={1}>
                {currentLanguage}
              </Text>
              <Icon name="chevron-forward" size={16} className="text-muted" />
            </View>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
    </>
  )
}
