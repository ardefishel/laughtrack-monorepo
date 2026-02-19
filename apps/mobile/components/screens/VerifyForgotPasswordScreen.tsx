import { useRouter } from 'expo-router';
import { Button, Input, TextField } from 'heroui-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthContainer } from '@/components/auth/AuthContainer';

export default function VerifyForgotPasswordScreen() {
    const router = useRouter();
    const [code, setCode] = useState('');

    return (
        <AuthContainer
            header={{ title: 'Verify Code', subtitle: 'Enter the 6-digit code sent to your email' }}
        >
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="Enter code"
                        placeholderTextColor="var(--muted)"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        className="text-foreground text-center text-2xl tracking-widest"
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={() => console.log('Verify pressed')}
                    className="w-full"
                >
                    <Button.Label>Verify</Button.Label>
                </Button>

                <Pressable
                    onPress={() => console.log('Resend code')}
                    className="self-center mt-4"
                >
                    <Text className="text-accent text-sm">Didn&apos;t receive it? Resend</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.push('/auth')}
                    className="self-center mt-2"
                >
                    <Text className="text-muted text-sm">Back to Sign In</Text>
                </Pressable>
            </View>
        </AuthContainer>
    );
}
