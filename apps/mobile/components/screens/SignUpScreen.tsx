import { useRouter } from 'expo-router';
import { Button, Input, TextField } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        const result = await signUp(email, password, name);
        setLoading(false);
        if (result.success) {
            Alert.alert('Account Created', 'You can now sign in with your credentials', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Sign Up Failed', result.error ?? 'An unexpected error occurred');
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const result = await signInWithGoogle();
        setGoogleLoading(false);
        if (result.success) {
            router.back();
        } else {
            Alert.alert('Google Sign In Failed', result.error ?? 'An unexpected error occurred');
        }
    };

    return (
        <AuthContainer
            header={{ title: 'Create Account', subtitle: 'Sign up to get started' }}
        >
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="Name"
                        placeholderTextColor="var(--muted)"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        className="text-foreground"
                    />
                </TextField>

                <TextField>
                    <Input
                        placeholder="Email"
                        placeholderTextColor="var(--muted)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="text-foreground"
                    />
                </TextField>

                <TextField>
                    <Input
                        placeholder="Password"
                        placeholderTextColor="var(--muted)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        className="text-foreground"
                    />
                </TextField>

                <TextField>
                    <Input
                        placeholder="Confirm Password"
                        placeholderTextColor="var(--muted)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        className="text-foreground"
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={handleSignUp}
                    isDisabled={loading}
                    className="w-full"
                >
                    <Button.Label>{loading ? 'Creating Account...' : 'Sign Up'}</Button.Label>
                </Button>

                <View className="flex-row items-center gap-3 my-4">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="text-muted text-sm">or continue with</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                <Button
                    variant="outline"
                    onPress={handleGoogleSignIn}
                    isDisabled={googleLoading}
                    className="w-full"
                >
                    <Icon
                        name="logo-google"
                        size={20}
                        className="text-foreground mr-2"
                    />
                    <Button.Label>{googleLoading ? 'Signing In...' : 'Google'}</Button.Label>
                </Button>

                <View className="flex-row justify-center gap-1 mt-4">
                    <Text className="text-muted">Already have an account?</Text>
                    <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel="Sign In">
                        <Text className="text-accent">Sign In</Text>
                    </Pressable>
                </View>
            </View>
        </AuthContainer>
    );
}
