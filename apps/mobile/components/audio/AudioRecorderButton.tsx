import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { withUniwind } from 'uniwind';
import { createNamespacedLogger } from '@/lib/logger';

const uiLogger = createNamespacedLogger('ui');

const StyledIonicons = withUniwind(Ionicons);

export function AudioRecorderButton() {
  const router = useRouter();

  uiLogger.debug('[AudioRecorderButton] RENDER');

  const handleOpenSheet = () => {
    uiLogger.debug('[AudioRecorderButton] Opening recording bottom sheet');
    router.push('/recording-capture-bottom-sheet');
  };

  return (
    <Pressable
      onPress={handleOpenSheet}
      className="p-2.5 rounded-lg bg-field-background"
      hitSlop={8}
      accessibilityLabel="Record audio"
      accessibilityRole="button"
    >
      <StyledIonicons name="mic" size={18} className="text-warning" />
    </Pressable>
  );
}
