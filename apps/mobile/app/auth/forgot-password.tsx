import { Button, Input, TextField } from 'heroui-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { AuthContainer } from '@/components/auth/AuthContainer';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <AuthContainer
      header={{ title: 'Reset Password', subtitle: 'Enter your email to receive reset instructions' }}
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

        <Button
          variant="primary"
          onPress={() => console.log('Send Reset Link pressed')}
          className="w-full"
        >
          <Button.Label>Send Reset Link</Button.Label>
        </Button>

        <Pressable
          onPress={() => router.push('/auth')}
          className="self-center mt-4"
        >
          <Text className="text-accent text-sm">Back to Sign In</Text>
        </Pressable>
      </View>
    </AuthContainer>
  );
}