import React from 'react'
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

interface AuthContainerProps {
    title: string
    subtitle: string
    children: React.ReactNode
}

export function AuthContainer({ title, subtitle, children }: AuthContainerProps) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                className="flex-1 bg-background"
            >
                <View className="flex-1 justify-center px-6 py-8">
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-foreground">
                            {title}
                        </Text>
                        <Text className="text-base text-muted mt-2">
                            {subtitle}
                        </Text>
                    </View>
                    {children}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}