import { memo } from 'react';
import { View, Text } from 'react-native';
import { JokeStatus } from '@/lib/types';

interface MinimalStatusIndicatorProps {
  status: JokeStatus;
  showLabel?: boolean;
}

function MinimalStatusIndicatorComponent({ status, showLabel = true }: MinimalStatusIndicatorProps) {
  return (
    <View className="flex-row items-center gap-1">
      <View
        className={`w-2 h-2 rounded-full ${
          status === 'published'
            ? 'bg-success'
            : status === 'draft'
            ? 'bg-warning'
            : 'bg-muted'
        }`}
      />
      {showLabel && (
        <Text className="text-xs text-muted/70 font-medium lowercase">
          {status}
        </Text>
      )}
    </View>
  );
}

export const MinimalStatusIndicator = memo(MinimalStatusIndicatorComponent);
