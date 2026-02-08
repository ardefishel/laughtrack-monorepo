import { Chip } from 'heroui-native';
import { View, Text } from 'react-native';
import { JokeStatus, JokeSetStatus } from '@/lib/types';
import { getStatusColor } from '@/lib/jokeUtils';

interface StatusBadgeProps {
  status: JokeStatus | JokeSetStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showDot = true, size = 'sm' }: StatusBadgeProps) {
  const color = getStatusColor(status as JokeStatus);

  if (showDot) {
    return (
      <View className="flex-row items-center gap-1">
        <View className={`w-2 h-2 rounded-full ${
          status === 'published' ? 'bg-success' :
          status === 'draft' ? 'bg-warning' :
          status === 'performed' ? 'bg-primary' :
          status === 'bombed' ? 'bg-danger' :
          status === 'killed' ? 'bg-success' :
          'bg-muted'
        }`} />
        <Text className="text-foreground text-sm font-medium capitalize">
          {status}
        </Text>
      </View>
    );
  }

  return (
    <Chip size={size} variant="soft" color={color}>
      {status}
    </Chip>
  );
}
