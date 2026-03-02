import { AuthContainer } from '@/components/feature/auth/container'
import { authClient } from '@/lib/auth-client'
import { authLogger } from '@/lib/loggers'
import { router } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, Text, View } from 'react-native'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleReset = useCallback(async () => {
        if (!email.trim()) return
        setIsLoading(true)
        authLogger.info('Password reset requested')
        try {
            await authClient.forgetPassword({ email: email.trim(), redirectTo: 'laughtrack://reset-password' })
            authLogger.info('Password reset email sent')
            Alert.alert('Email Sent', 'Check your email for a password reset link.', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            authLogger.error('Password reset failed:', error)
            Alert.alert('Error', 'Failed to send reset email. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [email])

    return (
        <AuthContainer title='Reset Password' subtitle='Enter your email to receive a reset link'>
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="Email"
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
                >
                    <Button.Label>{isLoading ? 'Sending...' : 'Send Reset Link'}</Button.Label>
                </Button>

                <Button
                    variant="ghost"
                    onPress={() => router.back()}
                    className="w-full"
                >
                    <Button.Label>Back to Sign In</Button.Label>
                </Button>
            </View>
        </AuthContainer>
    )
}
