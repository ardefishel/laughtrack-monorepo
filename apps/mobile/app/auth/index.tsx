import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, TextField } from 'heroui-native';
import { withUniwind } from 'uniwind';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { useAuth } from '@/context/AuthContext';

const StyledIonicons = withUniwind(Ionicons);

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      router.back();
    } else {
      Alert.alert('Sign In Failed', result.error ?? 'An unexpected error occurred');
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
      header={{ title: 'Welcome Back', subtitle: 'Sign in to your account' }}
    >
      <View className="gap-4">
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

        <Pressable
          onPress={() => router.push('/auth/forgot-password')}
          className="self-end"
        >
          <Text className="text-accent text-sm">Forgot Password?</Text>
        </Pressable>

        <Button
          variant="primary"
          onPress={handleSignIn}
          isDisabled={loading}
          className="w-full"
        >
          <Button.Label>{loading ? 'Signing In...' : 'Sign In'}</Button.Label>
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
          <StyledIonicons
            name="logo-google"
            size={20}
            className="text-foreground mr-2"
          />
          <Button.Label>{googleLoading ? 'Signing In...' : 'Google'}</Button.Label>
        </Button>

        <View className="flex-row justify-center gap-1 mt-4">
          <Text className="text-muted">Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push('/auth/sign-up')}>
            <Text className="text-accent">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </AuthContainer>
  );
}
