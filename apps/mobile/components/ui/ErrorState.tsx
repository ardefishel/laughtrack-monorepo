import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

interface ErrorStateProps {
  title: string;
  message?: string;
  icon?: 'alert' | 'help';
}

export function ErrorState({ title, message, icon = 'alert' }: ErrorStateProps) {
  const iconName = icon === 'alert' ? 'alert-circle-outline' : 'help-circle-outline';

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <StyledIonicons name={iconName} size={64} className="text-danger mb-4" />
      <Text className="text-foreground text-lg">{title}</Text>
      {message && <Text className="text-muted text-sm mt-1">{message}</Text>}
    </View>
  );
}
