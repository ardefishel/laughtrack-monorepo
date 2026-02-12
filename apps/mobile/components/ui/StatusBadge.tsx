import { getStatusColor } from '@/lib/jokeUtils';
import { getStatusDotClass } from '@/lib/status';
import { JokeSetStatus, JokeStatus } from '@laughtrack/shared-types';
import { Chip } from 'heroui-native';
import { Text, View } from 'react-native';

interface StatusBadgeProps {
  status: JokeStatus | JokeSetStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showDot = true, size = 'sm' }: StatusBadgeProps) {
  if (showDot) {
    return (
      <View className="flex-row items-center gap-1">
        <View className={`w-2 h-2 rounded-full ${getStatusDotClass(status)}`} />
        <Text className="text-foreground text-sm font-medium capitalize">
          {status}
        </Text>
      </View>
    );
  }

  return (
    <Chip size={size} variant="soft" color={getStatusColor(status as JokeStatus)}>
      {status}
    </Chip>
  );
}
