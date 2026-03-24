import { useAuth } from '@/features/auth/context/auth-context'
import { AuthContainer } from '@/features/auth/components/container'
import { buildVerifyPendingRoute } from '@/features/auth/utils/verification-flow'
import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import { useRouter } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

export default function SignUp() {
    const router = useRouter()
    const { t } = useI18n()
    const { signUp, signInWithGoogle } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const handleSignUp = useCallback(async () => {
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert(t('auth.alerts.errorTitle'), t('auth.alerts.fillAllFields'))
            return
        }
        if (password !== confirmPassword) {
            Alert.alert(t('auth.alerts.errorTitle'), t('auth.alerts.passwordsDoNotMatch'))
            return
        }
        if (password.length < 8) {
            Alert.alert(t('auth.alerts.errorTitle'), t('auth.alerts.passwordTooShort'))
            return
        }
        setIsLoading(true)
        try {
            const result = await signUp(email.trim(), password, name.trim())
            if (result.success) {
                router.replace(buildVerifyPendingRoute(email, 'signup'))
            } else {
                Alert.alert(t('auth.alerts.signUpFailed'), result.error ?? t('auth.alerts.tryAgain'))
            }
        } finally {
            setIsLoading(false)
        }
    }, [confirmPassword, email, name, password, router, signUp, t])

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
        <AuthContainer title={t('auth.signUp.title')} subtitle={t('auth.signUp.subtitle')}>
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder={t('auth.placeholders.name')}
                        autoCapitalize="words"
                        className="text-foreground"
                        value={name}
                        onChangeText={setName}
                    />
                </TextField>

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

                <TextField>
                    <Input
                        placeholder={t('auth.placeholders.confirmPassword')}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={handleSignUp}
                    isDisabled={
                        isLoading ||
                        isGoogleLoading ||
                        !name.trim() ||
                        !email.trim() ||
                        !password.trim() ||
                        !confirmPassword.trim()
                    }
                    className="w-full"
                    accessibilityLabel={t('auth.common.signUp')}
                >
                    <Button.Label>{isLoading ? t('auth.signUp.createAccountLoading') : t('auth.common.signUp')}</Button.Label>
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
                    <Text className="text-muted">{t('auth.signUp.alreadyHaveAccount')}</Text>
                    <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel={t('auth.signUp.signInAccessibilityLabel')}>
                        <Text className="text-accent">{t('auth.common.signIn')}</Text>
                    </Pressable>
                </View>
            </View>
        </AuthContainer>
    )
}
