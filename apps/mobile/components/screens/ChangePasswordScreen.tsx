import { useRouter } from 'expo-router';
import { Button, Input, TextField } from 'heroui-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { uiLogger } from '@/lib/loggers';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <AuthContainer
            header={{ title: 'New Password', subtitle: 'Create a new password for your account' }}
        >
            <View className="gap-4">
                <TextField>
                    <Input
                        placeholder="New Password"
                        placeholderTextColor="var(--muted)"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        className="text-foreground"
                    />
                </TextField>

                <TextField>
                    <Input
                        placeholder="Confirm New Password"
                        placeholderTextColor="var(--muted)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        className="text-foreground"
                    />
                </TextField>

                <Button
                    variant="primary"
                    onPress={() => uiLogger.debug('[ChangePasswordScreen] Change Password pressed')}
                    className="w-full"
                >
                    <Button.Label>Update Password</Button.Label>
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
