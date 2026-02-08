import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

interface LoadingStateProps {
  message?: string;
  size?: number;
}

export function LoadingState({ message = 'Loading...', size = 64 }: LoadingStateProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <StyledIonicons name="refresh-outline" size={size} className="text-muted animate-spin mb-4" />
      <Text className="text-muted">{message}</Text>
    </View>
  );
}
