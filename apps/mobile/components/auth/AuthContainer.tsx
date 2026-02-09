import React, { ReactNode } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

interface AuthContainerProps {
  children: ReactNode;
  header?: {
    title: string;
    subtitle?: string;
  };
}

export function AuthContainer({ children, header }: AuthContainerProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {header && (
            <View className="mb-8">
              <Text className="text-3xl font-bold text-foreground">
                {header.title}
              </Text>
              {header.subtitle && (
                <Text className="text-base text-muted mt-2">
                  {header.subtitle}
                </Text>
              )}
            </View>
          )}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default AuthContainer;
