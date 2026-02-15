import { View, Text } from 'react-native';

import { Icon } from './Icon';

interface LoadingStateProps {
  message?: string;
  size?: number;
}

export function LoadingState({ message = 'Loading...', size = 64 }: LoadingStateProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <Icon name="refresh-outline" size={size} className="text-muted animate-spin mb-4" />
      <Text className="text-muted">{message}</Text>
    </View>
  );
}
