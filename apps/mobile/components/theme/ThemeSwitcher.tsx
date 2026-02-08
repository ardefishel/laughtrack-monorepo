import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <View className="flex-row items-center justify-between p-4 bg-surface rounded-lg">
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl">{isDark ? '🌙' : '☀️'}</Text>
        <View>
          <Text className="text-base font-semibold text-foreground">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Text className="text-sm text-muted">
            {isDark ? 'Easier on the eyes at night' : 'Classic bright appearance'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={toggleTheme}
        className={`w-14 h-8 rounded-full p-1 ${isDark ? 'bg-accent' : 'bg-default'}`}
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
      >
        <View className={`w-6 h-6 rounded-full bg-surface shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
      </Pressable>
    </View>
  );
}
