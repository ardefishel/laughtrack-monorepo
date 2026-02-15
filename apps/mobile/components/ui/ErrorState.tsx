import { View, Text } from 'react-native';

import { Icon } from './Icon';

interface ErrorStateProps {
  title: string;
  message?: string;
  icon?: 'alert' | 'help';
}

export function ErrorState({ title, message, icon = 'alert' }: ErrorStateProps) {
  const iconName = icon === 'alert' ? 'alert-circle-outline' : 'help-circle-outline';

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Icon name={iconName} size={64} className="text-danger mb-4" />
      <Text className="text-foreground text-lg">{title}</Text>
      {message && <Text className="text-muted text-sm mt-1">{message}</Text>}
    </View>
  );
}
