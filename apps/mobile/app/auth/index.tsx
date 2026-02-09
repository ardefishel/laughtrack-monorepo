import { Ionicons } from '@expo/vector-icons';
import { Button, Input, TextField } from 'heroui-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { withUniwind } from 'uniwind';

import { AuthContainer } from '@/components/auth/AuthContainer';

const StyledIonicons = withUniwind(Ionicons);

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          onPress={() => console.log('Sign In pressed')}
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
          onPress={() => console.log('Google Sign In pressed')}
          className="w-full"
        >
          <StyledIonicons
            name="logo-google"
            size={20}
            className="text-foreground mr-2"
          />
          <Button.Label>Google</Button.Label>
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