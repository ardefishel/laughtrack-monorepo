import { formatDuration } from '@/lib/audioStorage';
import { createNamespacedLogger } from '@/lib/logger';
import { Ionicons } from '@expo/vector-icons';
import { Button, Dialog, Input, TextField } from 'heroui-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const uiLogger = createNamespacedLogger('ui');

const StyledIonicons = withUniwind(Ionicons);

interface RecordingData {
  filePath: string;
  duration: number;
  size: number;
}

interface DescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordingData: RecordingData | null;
  onSubmit: (data: RecordingData & { description: string }) => void;
}

export function DescriptionDialog({ isOpen, onClose, recordingData, onSubmit }: DescriptionDialogProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && recordingData) {
      uiLogger.debug(`[DescriptionDialog] Dialog opened: duration=${recordingData.duration}ms, size=${recordingData.size} bytes`);
    }
  }, [isOpen, recordingData]);

  const handleSubmit = () => {
    if (!description.trim()) {
      uiLogger.warn('[DescriptionDialog] Empty description submitted');
      setError('Please enter a description');
      return;
    }

    if (!recordingData) {
      uiLogger.warn('[DescriptionDialog] Submit called but no recording data available');
      return;
    }

    uiLogger.info(`[DescriptionDialog] Submitting: description="${description.substring(0, 30)}...", duration=${recordingData.duration}ms`);
    onSubmit({
      ...recordingData,
      description: description.trim(),
    });

    setDescription('');
    setError('');
  };

  const handleClose = () => {
    uiLogger.debug('[DescriptionDialog] Dialog closed by user');
    setDescription('');
    setError('');
    onClose();
  };

  if (!recordingData) {
    uiLogger.debug('[DescriptionDialog] No recording data, returning null');
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Content className="bg-surface">
        <View className="p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center mb-4">
              <StyledIonicons name="checkmark-circle" size={40} className="text-success" />
            </View>
            <Text className="text-foreground text-xl font-semibold mb-1">
              Recording Complete!
            </Text>
            <Text className="text-muted text-sm">
              {formatDuration(recordingData.duration)} recorded
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-foreground text-sm font-medium mb-2">
              What is this joke about?
            </Text>
            <TextField className="w-full">
              <Input
                placeholder="E.g., Dad joke about chickens..."
                placeholderTextColor="var(--muted)"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (error) {
                    setError('');
                    uiLogger.debug('[DescriptionDialog] Error cleared');
                  }
                }}
                className="text-foreground py-3"
                multiline
                maxLength={200}
              />
            </TextField>
            {error && (
              <Text className="text-danger text-xs mt-1">{error}</Text>
            )}
          </View>

          <View className="flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={handleClose}>
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button variant="primary" className="flex-1" onPress={handleSubmit}>
              <Button.Label>Create Joke</Button.Label>
            </Button>
          </View>
        </View>
      </Dialog.Content>
    </Dialog>
  );
}
