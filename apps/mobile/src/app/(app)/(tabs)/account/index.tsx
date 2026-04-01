import { useAuth } from '@/features/auth/context/auth-context'
import { LanguagePreferenceGroup } from '@/features/account/components/language-preference-group'
import { Icon } from '@/components/ui/ion-icon'
import { SafeAreaView } from '@/components/ui/safe-area-view'
import { AppConfig } from '@/config/app'
import { database } from '@/database'
import { useI18n } from '@/i18n'
import { uiLogger } from '@/lib/loggers'
import { performSync } from '@/lib/sync'
import { useRouter } from 'expo-router'
import { Button, ListGroup, Separator } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Image } from 'expo-image'
import { Alert, Linking, ScrollView, Text, View } from 'react-native'

const MARKETING_URL = process.env.EXPO_PUBLIC_MARKETING_URL ?? 'https://laughtrack.app'
const PRIVACY_POLICY_URL = `${MARKETING_URL}/privacy`
const TERMS_OF_SERVICE_URL = `${MARKETING_URL}/terms`

export default function AccountScreen() {
    const router = useRouter()
    const { user, isAuthenticated, signOut } = useAuth()
    const { t } = useI18n()
    const [isSyncing, setIsSyncing] = useState(false)
    const avatarInitial = user?.name?.trim().charAt(0).toUpperCase() || 'G'

    const openExternalUrl = useCallback(async (url: string) => {
        try {
            await Linking.openURL(url)
        } catch (error) {
            uiLogger.error('Account screen failed to open external link', { error, url })
        }
    }, [])

    const handleSync = useCallback(async () => {
        if (!isAuthenticated) {
            Alert.alert(t('account.signInRequiredTitle'), t('account.signInRequiredMessage'), [
                { text: t('bitMeta.cancel') },
                { text: t('auth.common.signIn'), onPress: () => router.push('/(app)/(auth)/sign-in') }
            ])
            return
        }
        setIsSyncing(true)
        try {
            const result = await performSync(database)
            if (result.success) {
                Alert.alert(t('account.syncSuccess'), result.message)
            } else {
                Alert.alert(t('account.syncFailed'), result.message)
            }
        } finally {
            setIsSyncing(false)
        }
    }, [isAuthenticated, router, t])

    const handleSignOut = useCallback(async () => {
        Alert.alert(t('auth.common.signOut'), t('account.confirmSignOutMessage'), [
            { text: t('bitMeta.cancel') },
            { text: t('auth.common.signOut'), style: 'destructive', onPress: () => void signOut() }
        ])
    }, [signOut, t])

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-4">
                <Text className="text-2xl font-bold text-foreground mb-6">{t('account.title')}</Text>

                <View className="flex-row items-center gap-4 mb-8">
                    <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-accent">
                        {user?.image ? (
                            <Image source={{ uri: user.image }} className="h-full w-full" contentFit="cover" />
                        ) : (
                            <Text className="text-base font-semibold text-accent-foreground">{avatarInitial}</Text>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">{user?.name ?? t('account.guest')}</Text>
                        <Text className="text-sm text-muted">{isAuthenticated ? user?.email : t('account.syncDescriptionGuest')}</Text>
                    </View>
                </View>

                {/* Data */}
                <Text className="text-sm text-muted mb-2 ml-2">{t('account.data')}</Text>
                <ListGroup className="mb-6">
                    <ListGroup.Item onPress={handleSync} disabled={isSyncing || !isAuthenticated} accessibilityLabel={t('account.syncData')}>
                        <ListGroup.ItemPrefix>
                            <Icon name="sync-outline" size={22} className={isAuthenticated ? 'text-foreground' : 'text-muted'} />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>{isSyncing ? t('account.syncLoading') : t('account.syncData')}</ListGroup.ItemTitle>
                            <ListGroup.ItemDescription>
                                {isAuthenticated ? t('account.syncDescriptionSignedIn') : t('account.syncDescriptionGuest')}
                            </ListGroup.ItemDescription>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                </ListGroup>

                <LanguagePreferenceGroup />

                {/* Information */}
                <Text className="text-sm text-muted mb-2 ml-2">{t('account.information')}</Text>
                <ListGroup className="mb-6">
                    <ListGroup.Item onPress={() => void openExternalUrl(TERMS_OF_SERVICE_URL)}>
                        <ListGroup.ItemPrefix>
                            <Icon name="document-text-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>{t('account.termsOfService')}</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                    <Separator className="mx-4" />
                    <ListGroup.Item onPress={() => void openExternalUrl(PRIVACY_POLICY_URL)}>
                        <ListGroup.ItemPrefix>
                            <Icon name="shield-checkmark-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>{t('account.privacyPolicy')}</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                    <Separator className="mx-4" />
                    <ListGroup.Item>
                        <ListGroup.ItemPrefix>
                            <Icon name="information-circle-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>{t('account.appVersion')}</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix>
                            <Text className="text-sm text-muted">{AppConfig.version}</Text>
                        </ListGroup.ItemSuffix>
                    </ListGroup.Item>
                </ListGroup>

                {isAuthenticated ? (
                    <Button
                        variant="primary"
                        onPress={handleSignOut}
                        className="w-full"
                        accessibilityLabel={t('auth.common.signOut')}
                    >
                        <Icon name="log-out-outline" size={20} className="text-accent-foreground mr-2" />
                        <Button.Label>{t('auth.common.signOut')}</Button.Label>
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onPress={() => router.push('/(app)/(auth)/sign-in')}
                        className="w-full"
                        accessibilityLabel={t('auth.common.signIn')}
                    >
                        <Icon name="log-in-outline" size={20} className="text-accent-foreground mr-2" />
                        <Button.Label>{t('auth.common.signIn')}</Button.Label>
                    </Button>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
