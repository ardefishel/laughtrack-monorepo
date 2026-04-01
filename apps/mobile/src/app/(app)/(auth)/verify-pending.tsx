import { AuthContainer } from '@/features/auth/components/container'
import { getResendFeedback, getVerifyPendingCopy, type VerificationFlowMode } from '@/features/auth/utils/verification-flow'
import { authClient } from '@/lib/auth-client'
import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from 'heroui-native'
import { useCallback, useMemo, useState } from 'react'
import { Alert, Text, View } from 'react-native'

export default function VerifyPending() {
    const router = useRouter()
    const { t } = useI18n()
    const params = useLocalSearchParams<{ email?: string; mode?: string }>()
    const email = useMemo(() => {
        const rawEmail = (Array.isArray(params.email) ? params.email[0] : params.email) ?? ''
        return rawEmail.trim().toLowerCase()
    }, [params.email])
    const mode = useMemo(() => ((Array.isArray(params.mode) ? params.mode[0] : params.mode) ?? 'signup') as VerificationFlowMode, [params.mode])
    const [isResending, setIsResending] = useState(false)

    const copy = useMemo(() => getVerifyPendingCopy(mode), [mode])

    const handleResend = useCallback(async () => {
        if (!email) {
            Alert.alert(t('auth.verifyPending.missingEmailTitle'), t('auth.verifyPending.missingEmailMessage'))
            return
        }

        setIsResending(true)
        try {
            const result = await authClient.sendVerificationEmail({ email })
            if (result.error) {
                const feedback = getResendFeedback(result.error.message || t('auth.alerts.tryAgain'))
                Alert.alert(feedback.title, feedback.message)
                return
            }

            const feedback = getResendFeedback()
            Alert.alert(feedback.title, feedback.message)
        } catch {
            const feedback = getResendFeedback(t('auth.alerts.tryAgain'))
            Alert.alert(feedback.title, feedback.message)
        } finally {
            setIsResending(false)
        }
    }, [email, t])

    return (
        <AuthContainer title={copy.title} subtitle={copy.subtitle}>
            <View className="gap-6">
                <View className="rounded-3xl border border-border bg-background px-5 py-6">
                    <View className="mb-4 flex-row items-center gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                            <Icon name="mail-outline" size={24} className="text-accent" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-foreground">{t('auth.verifyPending.checkInbox')}</Text>
                            <Text className="text-sm text-muted">{copy.body}</Text>
                        </View>
                    </View>

                    <View className="rounded-2xl bg-foreground/5 px-4 py-3">
                        <Text className="text-xs uppercase tracking-[0.18em] text-muted">{t('auth.verifyPending.emailLabel')}</Text>
                        <Text className="mt-1 text-sm text-foreground">{email || t('auth.verifyPending.useRecentAddress')}</Text>
                    </View>
                </View>

                <View className="gap-3">
                    <Text className="text-sm leading-6 text-muted">{t('auth.verifyPending.instructions.openEmail')}</Text>
                    <Text className="text-sm leading-6 text-muted">{t('auth.verifyPending.instructions.spamHint')}</Text>
                </View>

                <View className="gap-3">
                    <Button
                        variant="primary"
                        onPress={handleResend}
                        isDisabled={isResending || !email}
                        className="w-full"
                        accessibilityLabel={t('auth.verifyPending.resendButton')}
                    >
                        <Button.Label>{isResending ? t('auth.verifyPending.resendSending') : t('auth.verifyPending.resendButton')}</Button.Label>
                    </Button>

                    <Button
                        variant="ghost"
                        onPress={() => router.replace('/(app)/(auth)/sign-in')}
                        className="w-full"
                        accessibilityLabel={t('auth.verifyPending.backToSignIn')}
                    >
                        <Button.Label>{t('auth.verifyPending.backToSignIn')}</Button.Label>
                    </Button>
                </View>
            </View>
        </AuthContainer>
    )
}
