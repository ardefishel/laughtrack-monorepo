import { useAuth } from '@/context/auth-context'
import { AuthContainer } from '@/components/feature/auth/container'
import { Icon } from '@/components/ui/ion-icon'
import { router } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

export default function SignUp() {
    const { signUp } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSignUp = useCallback(async () => {
        if (!name.trim() || !email.trim() || !password.trim()) return
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.')
            return
        }
        setIsLoading(true)
        try {
            const result = await signUp(email.trim(), password, name.trim())
            if (result.success) {
                Alert.alert('Account Created', 'You can now sign in.', [
                    { text: 'OK', onPress: () => router.back() }
                ])
            } else {
                Alert.alert('Sign Up Failed', result.error ?? 'Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }, [name, email, password, confirmPassword, signUp])

    return (
        <AuthContainer title='Create Account' subtitle='Sign up to get started'>
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="Name"
                        autoCapitalize="words"
                        className="text-foreground"
                        value={name}
                        onChangeText={setName}
                    />
                </TextField>

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

                <TextField>
                    <Input
                        placeholder="Confirm Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={handleSignUp}
                    isDisabled={isLoading || !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
                    className="w-full"
                >
                    <Button.Label>{isLoading ? 'Creating Account...' : 'Sign Up'}</Button.Label>
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
                    <Text className="text-muted">Already have an account?</Text>
                    <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel="Sign In">
                        <Text className="text-accent">Sign In</Text>
                    </Pressable>
                </View>
            </View>
        </AuthContainer>
    )
}
