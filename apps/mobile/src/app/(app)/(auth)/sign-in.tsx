import { useAuth } from '@/context/auth-context'
import { AuthContainer } from '@/components/feature/auth/container'
import { Icon } from '@/components/ui/ion-icon'
import { router } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

export default function SignIn() {
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSignIn = useCallback(async () => {
        if (!email.trim() || !password.trim()) return
        setIsLoading(true)
        try {
            const result = await signIn(email.trim(), password)
            if (result.success) {
                router.dismissAll()
            } else {
                Alert.alert('Sign In Failed', result.error ?? 'Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }, [email, password, signIn])

    return (
        <AuthContainer title='Welcome Back' subtitle='Sign in to your account'>
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

                <TextField>
                    <Input
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </TextField>

                <Button
                    onPress={() => router.push('/(app)/(auth)/forgot-password')}
                    className="self-end"
                    accessibilityRole="link"
                    accessibilityLabel="Forgot Password"
                    variant='ghost'
                >
                    <Text className="text-accent text-sm">Forgot Password?</Text>
                </Button>

                <Button
                    variant="primary"
                    onPress={handleSignIn}
                    isDisabled={isLoading || !email.trim() || !password.trim()}
                    className="w-full"
                >
                    <Button.Label>{isLoading ? 'Signing In...' : 'Sign In'}</Button.Label>
                </Button>

                <View className="flex-row items-center gap-3 my-4">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="text-muted text-sm">or continue with</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                <Button
                    variant="outline"
                    onPress={() => { }}
                    className="w-full"
                >
                    <Icon
                        name="logo-google"
                        size={20}
                        className="text-foreground mr-2"
                    />
                    <Button.Label>Google</Button.Label>
                </Button>

                <View className="flex-row justify-center gap-1 mt-4">
                    <Text className="text-muted">Don&apos;t have an account?</Text>
                    <Pressable onPress={() => router.push('/(app)/(auth)/sign-up')} accessibilityRole="link" accessibilityLabel="Sign Up">
                        <Text className="text-accent">Sign Up</Text>
                    </Pressable>
                </View>
            </View>
        </AuthContainer>
    )
}
