import React, { memo, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import { createNamespacedLogger } from '@/lib/logger';

const uiLogger = createNamespacedLogger('ui');

const StyledIonicons = withUniwind(Ionicons);

interface AudioIndicatorProps {
  recordingCount: number;
  onPress?: () => void;
}

function AudioIndicatorComponent({ recordingCount, onPress }: AudioIndicatorProps) {
  useEffect(() => {
    if (recordingCount > 0) {
      uiLogger.debug(`[AudioIndicator] Rendering with count=${recordingCount}`);
    }
  }, [recordingCount]);

  if (recordingCount === 0) {
    return null;
  }

  const content = (
    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10">
      <StyledIonicons name="mic" size={12} className="text-warning" />
      <Text className="text-xs font-medium text-warning">{recordingCount}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityLabel={`${recordingCount} audio recordings`}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export const AudioIndicator = memo(AudioIndicatorComponent);
