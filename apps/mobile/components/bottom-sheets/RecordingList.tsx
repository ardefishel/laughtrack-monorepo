import RecordingListItem from '@/components/audio/RecordingListItem';
import { useRecordingPlayer } from '@/hooks/useAudioPlayer';
import { useAudioRecordingsQuery } from '@/hooks/useAudioRecordingsQuery';
import { uiLogger } from '@/lib/loggers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';

const RecordingListBottomSheet = () => {
    const router = useRouter();
    const { jokeId } = useLocalSearchParams<{ jokeId: string; }>();
    const { recordings, isLoading, error } = useAudioRecordingsQuery(jokeId);
    const { isPlaying, isLoading: isAudioLoading, loadError, activeRecordingId, toggle, clearError } = useRecordingPlayer();

    // Log when bottom sheet is opened and closed
    useEffect(() => {
        uiLogger.debug('[RecordingListBottomSheet] BOTTOM SHEET OPENED');
        return () => {
            uiLogger.debug('[RecordingListBottomSheet] BOTTOM SHEET CLOSED');
        };
    }, []);

    useEffect(() => {
        uiLogger.debug('[RecordingListBottomSheet] Active recording id:', activeRecordingId);
    }, [activeRecordingId]);



    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-foreground">Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-danger">Error loading recordings</Text>
            </View>
        );
    }

    return (
        <View collapsable={false} className="p-4 bg-surface flex h-screen flex-1">
            <View collapsable={false} className="flex-row items-center justify-between mb-4">
                <Text className="text-foreground text-lg font-semibold">
                    Recordings ({recordings.length})
                </Text>
                <View className="flex-row items-center gap-3">
                    <Pressable
                        onPress={() => {
                            uiLogger.debug('Pressed add recording');
                            router.push({ pathname: '/recording-capture-bottom-sheet', params: { jokeId } });
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Add recording"
                        className="min-h-[44px] min-w-[44px] justify-center items-center"
                    >
                        <Icon name="add" size={24} className="text-accent" />
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            uiLogger.debug('Pressed close recordings');
                            router.back();
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Close recordings"
                        className="min-h-[44px] min-w-[44px] justify-center items-center"
                    >
                        <Icon name="close" size={24} className="text-muted" />
                    </Pressable>
                </View>
            </View>

            {loadError && (
                <View className="mb-4 p-3 bg-danger/10 rounded-lg flex-row items-center justify-between">
                    <Text className="text-danger text-sm flex-1">{loadError}</Text>
                    <Pressable onPress={clearError} hitSlop={8}>
                        <Icon name="close-circle" size={20} className="text-danger" />
                    </Pressable>
                </View>
            )}

            {recordings.length === 0 ? (
                <View className="py-8 items-center">
                    <Icon name="mic-off-outline" size={48} className="text-muted mb-4" />
                    <Text className="text-muted text-sm">No recordings yet</Text>
                </View>
            ) : (
                <ScrollView>
                    {recordings.map((recording) => (
                        <RecordingListItem
                            key={recording.id}
                            recording={recording}
                            isPlaying={activeRecordingId === recording.id && isPlaying}
                            isLoading={activeRecordingId === recording.id && isAudioLoading}
                            onPlay={() => toggle(recording)}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};
export default RecordingListBottomSheet;
