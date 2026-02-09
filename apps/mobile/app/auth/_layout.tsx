import { Slot } from 'expo-router';
import React from 'react';
import { View, SafeAreaView } from 'react-native';

const AuthLayout = () => {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <Slot />
      </SafeAreaView>
    </View>
  );
};

export default AuthLayout;