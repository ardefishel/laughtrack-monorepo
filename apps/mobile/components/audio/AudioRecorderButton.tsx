import { logVerbose, uiLogger } from '@/lib/loggers';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import React from 'react';

import { Icon } from '@/components/ui/Icon';

export function AudioRecorderButton() {
  const router = useRouter();

  logVerbose(uiLogger, '[AudioRecorderButton] RENDER');

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
      <Icon name="mic" size={18} className="text-warning" />
    </Button>
  );
}
