import { AuthContainer } from '@/features/auth/components/container'
import { useI18n } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { authLogger } from '@/lib/loggers'
import { useRouter } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, View } from 'react-native'

type PasswordResetRequest = {
    email: string
    redirectTo: string
}

async function requestPasswordReset(input: PasswordResetRequest) {
    const forgetPassword = Reflect.get(authClient, 'forgetPassword')
    if (typeof forgetPassword === 'function') {
        await (forgetPassword as (payload: PasswordResetRequest) => Promise<unknown>)(input)
        return
    }

    const requestReset = Reflect.get(authClient, 'requestPasswordReset')
    if (typeof requestReset === 'function') {
        await (requestReset as (payload: PasswordResetRequest) => Promise<unknown>)(input)
        return
    }

    throw new Error('Password reset endpoint is unavailable')
}

export default function ForgotPassword() {
    const router = useRouter()
    const { t } = useI18n()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleReset = useCallback(async () => {
        if (!email.trim()) return
        setIsLoading(true)
        authLogger.info('Password reset requested')
        try {
            await requestPasswordReset({ email: email.trim(), redirectTo: 'laughtrack://reset-password' })
            authLogger.info('Password reset email sent')
            Alert.alert(t('auth.alerts.emailSentTitle'), t('auth.alerts.emailSentMessage'), [
                { text: t('common.ok'), onPress: () => router.back() }
            ])
        } catch (error) {
            authLogger.error('Password reset failed:', error)
            Alert.alert(t('auth.alerts.errorTitle'), t('auth.alerts.resetFailed'))
        } finally {
            setIsLoading(false)
        }
    }, [email, router, t])

    return (
        <AuthContainer title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder={t('auth.placeholders.email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={handleReset}
                    isDisabled={isLoading || !email.trim()}
                    className="w-full"
                    accessibilityLabel={t('auth.forgotPassword.sendResetLink')}
                >
                    <Button.Label>{isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetLink')}</Button.Label>
                </Button>

                <Button
                    variant="ghost"
                    onPress={() => router.back()}
                    className="w-full"
                    accessibilityLabel={t('auth.common.backToSignIn')}
                >
                    <Button.Label>{t('auth.common.backToSignIn')}</Button.Label>
                </Button>
            </View>
        </AuthContainer>
    )
}
