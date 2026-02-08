import RecordingListItem from '@/components/audio/RecordingListItem';
import { useRecordingPlayer } from '@/hooks/useAudioPlayer';
import { useAudioRecordingsQuery } from '@/hooks/useAudioRecordingsQuery';
import { uiLogger } from '@/lib/logger';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

const RecordingListBottomSheet = () => {
    const router = useRouter();
    const { jokeId } = useLocalSearchParams<{ jokeId: string; }>();
    const { recordings, isLoading, error } = useAudioRecordingsQuery(jokeId);
    const { isPlaying, isLoading: isAudioLoading, activeRecordingId, toggle } = useRecordingPlayer();

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
                        accessibilityLabel="Add recording"
                    >
                        <StyledIonicons name="add" size={24} className="text-accent" />
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            uiLogger.debug('Pressed close recordings');
                            router.back();
                        }}
                        hitSlop={8}
                        accessibilityLabel="Close recordings"
                    >
                        <StyledIonicons name="close" size={24} className="text-muted" />
                    </Pressable>
                </View>
            </View>

            {recordings.length === 0 ? (
                <View className="py-8 items-center">
                    <StyledIonicons name="mic-off-outline" size={48} className="text-muted mb-4" />
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
