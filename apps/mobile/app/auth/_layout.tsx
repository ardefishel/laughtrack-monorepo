import { Slot } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const StyledSafeAreaView = withUniwind(SafeAreaView)

const AuthLayout = () => {
  return (
    <View className="flex-1 bg-background">
      <StyledSafeAreaView className="flex-1">
        <AuthSlot />
      </StyledSafeAreaView>
    </View>
  );
};

const AuthSlot = () => {
  return (
    <Slot />
  )
}

export default AuthLayout;