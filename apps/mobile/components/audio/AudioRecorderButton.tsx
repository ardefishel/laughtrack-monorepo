import { createNamespacedLogger } from '@/lib/logger';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import React from 'react';
import { withUniwind } from 'uniwind';

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
    <Button isIconOnly
      onPress={handleOpenSheet}
      variant='ghost'
      hitSlop={8}
      accessibilityLabel="Record audio"
      accessibilityRole="button"
    >
      <StyledIonicons name="mic" size={18} className="text-warning" />
    </Button>
  );
}
