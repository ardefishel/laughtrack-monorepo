import { useAudio } from '@/context/AudioContext';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useRecordingSubmit } from '@/hooks/useRecordingSubmit';
import { formatDuration, getAudioFileInfo } from '@/lib/audioStorage';
import { hooksLogger } from '@/lib/loggers';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Input, TextField } from 'heroui-native';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

const MAX_DURATION_MS = 120000;

type Step = 'recording' | 'description';

export default function RecordingCaptureBottomSheet() {
  const router = useRouter();
  const { jokeId } = useLocalSearchParams<{ jokeId?: string }>();
  const { recordingOptions } = useAudio();

  const {
    elapsedTime,
    isRecording,
    recordedUri,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  } = useAudioRecorder(recordingOptions);

  const { currentStep, goToStep } = useMultiStepForm<Step>(['recording', 'description']);

  const {
    isSubmitting,
    submitRecording,
  } = useRecordingSubmit(jokeId);

  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [recordingData, setRecordingData] = useState<{
    filePath: string;
    duration: number;
    size: number;
  } | null>(null);

  const handleStartRecording = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  const handleDone = useCallback(async () => {
    if (!recordedUri) {
      hooksLogger.warn('[RecordingCaptureBottomSheet] No recording available');
      return;
    }
    const fileInfo = await getAudioFileInfo(recordedUri);
    const data = {
      filePath: recordedUri,
      duration: elapsedTime,
      size: fileInfo?.size ?? 0,
    };
    setRecordingData(data);
    goToStep('description');
  }, [recordedUri, elapsedTime, goToStep]);

  const handleCancelRecording = useCallback(() => {
    cancelRecording();
    reset();
    router.back();
  }, [cancelRecording, reset, router]);

  const handleBackToRecording = useCallback(() => {
    reset();
    goToStep('recording');
  }, [reset, goToStep]);

  const handleDescriptionSubmit = useCallback(async (description: string) => {
    if (!recordingData) {
      hooksLogger.warn('[RecordingCaptureBottomSheet] No recording data');
      return;
    }

    const result = await submitRecording({
      recordingData,
      description,
    });

    if (result) {
      hooksLogger.info(`[RecordingCaptureBottomSheet] Successfully created recording for joke_id=${result.jokeId}`);
      if (jokeId) {
        router.back();
      } else {
        router.replace({ pathname: '/', params: { scrollToTop: 'true' } });
      }
    }
  }, [recordingData, submitRecording, router, jokeId]);

  const progressPercent = Math.min((elapsedTime / MAX_DURATION_MS) * 100, 100);

  const renderRecordingStep = () => (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-foreground text-lg font-semibold">
          {isRecording ? 'Recording...' : recordedUri ? 'Recording Complete' : 'Record Audio'}
        </Text>
        <Text className="text-warning text-2xl font-bold">
          {formatDuration(elapsedTime)}
        </Text>
      </View>

      <View className="h-2 bg-default rounded-full mb-6 overflow-hidden">
        <View
          className="h-full bg-warning rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <Text className="text-muted text-xs text-center mb-6">
        Maximum recording time: 2 minutes
      </Text>

      <View className="flex-row justify-center gap-4">
        {!isRecording && !recordedUri && (
          <Pressable
            onPress={handleStartRecording}
            className="w-20 h-20 rounded-full bg-danger items-center justify-center"
            accessibilityLabel="Start recording"
            accessibilityRole="button"
          >
            <StyledIonicons name="mic" size={32} className="text-danger-foreground" />
          </Pressable>
        )}

        {isRecording && (
          <Pressable
            onPress={handleStopRecording}
            className="w-20 h-20 rounded-full bg-danger items-center justify-center"
            accessibilityLabel="Stop recording"
            accessibilityRole="button"
          >
            <View className="w-8 h-8 rounded-sm bg-danger-foreground" />
          </Pressable>
        )}

        {recordedUri && !isRecording && (
          <View className="flex-row gap-4">
            <Button variant="secondary" onPress={handleCancelRecording}>
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button variant="primary" onPress={handleDone}>
              <Button.Label>Done</Button.Label>
            </Button>
          </View>
        )}
      </View>
    </View>
  );

  const renderDescriptionStep = () => (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-foreground text-lg font-semibold">
          Add Description
        </Text>
        <Pressable onPress={handleBackToRecording} hitSlop={8}>
          <StyledIonicons name="chevron-back" size={24} className="text-muted" />
        </Pressable>
      </View>

      <View className="items-center mb-6">
        <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center mb-4">
          <StyledIonicons name="checkmark-circle" size={40} className="text-success" />
        </View>
        <Text className="text-foreground text-xl font-semibold mb-1">
          Recording Complete!
        </Text>
        <Text className="text-muted text-sm">
          {recordingData ? formatDuration(recordingData.duration) : '0:00'} recorded
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
              if (descriptionError) {
                setDescriptionError('');
              }
            }}
            className="text-foreground py-3"
            multiline
            maxLength={200}
          />
        </TextField>
        {descriptionError && (
          <Text className="text-danger text-xs mt-1">{descriptionError}</Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onPress={handleCancelRecording}
        >
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onPress={() => handleDescriptionSubmit(description)}
        >
          {isSubmitting ? (
            <StyledIonicons name="refresh-outline" size={16} className="text-accent-foreground animate-spin" />
          ) : (
            <Button.Label>{jokeId ? 'Add Recording' : 'Create Joke'}</Button.Label>
          )}
        </Button>
      </View>
    </View>
  );

  return (
    <View collapsable={false} className="p-6 bg-surface flex h-screen flex-1">
      {currentStep === 'recording' ? renderRecordingStep() : renderDescriptionStep()}
    </View>
  );
}
