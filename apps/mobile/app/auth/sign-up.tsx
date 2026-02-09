import { Ionicons } from '@expo/vector-icons';
import { Button, Input, TextField } from 'heroui-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { withUniwind } from 'uniwind';

import { AuthContainer } from '@/components/auth/AuthContainer';

const StyledIonicons = withUniwind(Ionicons);

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <AuthContainer
      header={{ title: 'Create Account', subtitle: 'Sign up to get started' }}
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
          onPress={() => console.log('Sign Up pressed')}
          className="w-full"
        >
          <Button.Label>Sign Up</Button.Label>
        </Button>

        <View className="flex-row items-center gap-3 my-4">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-muted text-sm">or continue with</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <Button
          variant="outline"
          onPress={() => console.log('Google Sign Up pressed')}
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
          <Text className="text-muted">Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-accent">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </AuthContainer>
  );
}