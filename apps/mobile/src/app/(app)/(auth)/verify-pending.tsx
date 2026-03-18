import { AuthContainer } from '@/features/auth/components/container'
import { getResendFeedback, getVerifyPendingCopy, type VerificationFlowMode } from '@/features/auth/utils/verification-flow'
import { authClient } from '@/lib/auth-client'
import { Icon } from '@/components/ui/ion-icon'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from 'heroui-native'
import { useCallback, useMemo, useState } from 'react'
import { Alert, Text, View } from 'react-native'

export default function VerifyPending() {
    const router = useRouter()
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
            Alert.alert('Missing Email', 'Go back and create your account again to request a fresh verification email.')
            return
        }

        setIsResending(true)
        try {
            const result = await authClient.sendVerificationEmail({ email })
            if (result.error) {
                const feedback = getResendFeedback(result.error.message || 'Please try again.')
                Alert.alert(feedback.title, feedback.message)
                return
            }

            const feedback = getResendFeedback()
            Alert.alert(feedback.title, feedback.message)
        } catch {
            const feedback = getResendFeedback('Please try again.')
            Alert.alert(feedback.title, feedback.message)
        } finally {
            setIsResending(false)
        }
    }, [email])

    return (
        <AuthContainer title={copy.title} subtitle={copy.subtitle}>
            <View className="gap-6">
                <View className="rounded-3xl border border-border bg-background px-5 py-6">
                    <View className="mb-4 flex-row items-center gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                            <Icon name="mail-outline" size={24} className="text-accent" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-foreground">Check your inbox</Text>
                            <Text className="text-sm text-muted">{copy.body}</Text>
                        </View>
                    </View>

                    <View className="rounded-2xl bg-foreground/5 px-4 py-3">
                        <Text className="text-xs uppercase tracking-[0.18em] text-muted">Email</Text>
                        <Text className="mt-1 text-sm text-foreground">{email || 'Use the address you just signed up with.'}</Text>
                    </View>
                </View>

                <View className="gap-3">
                    <Text className="text-sm leading-6 text-muted">Open the verification email from Laughtrack, tap the link, then come back here and sign in.</Text>
                    <Text className="text-sm leading-6 text-muted">If nothing shows up after a minute, check spam or request a fresh verification email.</Text>
                </View>

                <View className="gap-3">
                    <Button
                        variant="primary"
                        onPress={handleResend}
                        isDisabled={isResending || !email}
                        className="w-full"
                    >
                        <Button.Label>{isResending ? 'Sending...' : 'Resend Verification Email'}</Button.Label>
                    </Button>

                    <Button
                        variant="ghost"
                        onPress={() => router.replace('/(app)/(auth)/sign-in')}
                        className="w-full"
                    >
                        <Button.Label>Back to Sign In</Button.Label>
                    </Button>
                </View>
            </View>
        </AuthContainer>
    )
}
