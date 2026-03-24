import { useAuth } from '@/features/auth/context/auth-context'
import { AuthContainer } from '@/features/auth/components/container'
import { buildVerifyPendingRoute, isUnverifiedEmailFailure } from '@/features/auth/utils/verification-flow'
import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import { useRouter } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

export default function SignIn() {
    const router = useRouter()
    const { t } = useI18n()
    const { signIn, signInWithGoogle } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const handleSignIn = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t('auth.alerts.errorTitle'), t('auth.alerts.fillAllFields'))
            return
        }
        setIsLoading(true)
        try {
            const result = await signIn(email.trim(), password)
            if (result.success) {
                router.dismissAll()
            } else if (isUnverifiedEmailFailure(result)) {
                router.replace(buildVerifyPendingRoute(email, 'signin'))
            } else {
                Alert.alert(t('auth.alerts.signInFailed'), result.error ?? t('auth.alerts.tryAgain'))
            }
        } finally {
            setIsLoading(false)
        }
    }, [email, password, router, signIn, t])

    const handleGoogleSignIn = useCallback(async () => {
        setIsGoogleLoading(true)
        try {
            const result = await signInWithGoogle()
            if (result.success) {
                router.dismissAll()
            } else {
                Alert.alert(t('auth.alerts.googleSignInFailed'), result.error ?? t('auth.alerts.tryAgain'))
            }
        } finally {
            setIsGoogleLoading(false)
        }
    }, [router, signInWithGoogle, t])

    return (
        <AuthContainer title={t('auth.signIn.title')} subtitle={t('auth.signIn.subtitle')}>
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

                <TextField>
                    <Input
                        placeholder={t('auth.placeholders.password')}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </TextField>

                <Button
                    onPress={() => router.push('/(app)/(auth)/forgot-password')}
                    className="self-end"
                    accessibilityRole="link"
                    accessibilityLabel={t('auth.signIn.forgotPasswordAccessibilityLabel')}
                    variant='ghost'
                >
                    <Text className="text-accent text-sm">{t('auth.signIn.forgotPassword')}</Text>
                </Button>

                <Button
                    variant="primary"
                    onPress={handleSignIn}
                    isDisabled={isLoading || isGoogleLoading || !email.trim() || !password.trim()}
                    className="w-full"
                    accessibilityLabel={t('auth.common.signIn')}
                >
                    <Button.Label>{isLoading ? t('auth.common.signingIn') : t('auth.common.signIn')}</Button.Label>
                </Button>

                <View className="flex-row items-center gap-3 my-4">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="text-muted text-sm">{t('auth.common.continueWith')}</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                <Button
                    variant="outline"
                    onPress={handleGoogleSignIn}
                    isDisabled={isGoogleLoading || isLoading}
                    className="w-full"
                    accessibilityLabel={t('auth.common.google')}
                >
                    <Icon
                        name="logo-google"
                        size={20}
                        className="text-foreground mr-2"
                    />
                    <Button.Label>{isGoogleLoading ? t('auth.common.signingIn') : t('auth.common.google')}</Button.Label>
                </Button>

                <View className="flex-row justify-center gap-1 mt-4">
                    <Text className="text-muted">{t('auth.signIn.noAccount')}</Text>
                    <Pressable onPress={() => router.push('/(app)/(auth)/sign-up')} accessibilityRole="link" accessibilityLabel={t('auth.signIn.signUpAccessibilityLabel')}>
                        <Text className="text-accent">{t('auth.common.signUp')}</Text>
                    </Pressable>
                </View>
            </View>
        </AuthContainer>
    )
}
