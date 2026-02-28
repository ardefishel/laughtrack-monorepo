import { AuthContainer } from '@/components/feature/auth/container'
import { Icon } from '@/components/ui/ion-icon'
import { router } from 'expo-router'
import { Button, Input, TextField } from 'heroui-native'
import { Pressable, Text, View } from 'react-native'

export default function SignIn() {
    return (
        <AuthContainer title='Welcome Back' subtitle='Sign in to your account'>
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </TextField>

                <TextField>
                    <Input
                        placeholder="Password"
                        secureTextEntry
                    />
                </TextField>

                <Button
                    onPress={() => { }}
                    className="self-end"
                    accessibilityRole="link"
                    accessibilityLabel="Forgot Password"
                    variant='ghost'
                >
                    <Text className="text-accent text-sm">Forgot Password?</Text>
                </Button>

                <Button
                    variant="primary"
                    onPress={() => { }}
                    className="w-full"
                >
                    <Button.Label>Sign In</Button.Label>
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

