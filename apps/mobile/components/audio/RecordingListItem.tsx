import { formatDuration } from '@/lib/audioStorage';
import { logVerbose, uiLogger } from '@/lib/loggers';
import { AudioRecording } from '@/models/AudioRecording';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useThemeColor } from 'heroui-native';

import { Icon } from '@/components/ui/Icon';

interface RecordingListItemProp {
    recording: AudioRecording;
    isPlaying: boolean;
    isLoading?: boolean;
    onPlay: () => void;
    onDelete?: (recording: AudioRecording) => void;
}

const RecordingListItem = ({ recording, isPlaying, isLoading, onPlay, onDelete }: RecordingListItemProp) => {
    const accentColor = useThemeColor('accent');
    logVerbose(uiLogger, `[RecordingListItem] ${recording.id}: isPlaying=${isPlaying}, isLoading=${isLoading}`);
    return (
        <View collapsable={false} className="flex-row items-center justify-between py-3 border-b border-default">
            <Pressable
                onPress={onPlay}
                className="flex-row items-center gap-3 flex-1"
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause recording' : 'Play recording'}
            >
                <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                    {isLoading ? (
                        <ActivityIndicator size="small" color={accentColor} />
                    ) : (
                        <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            size={20}
                            className={isPlaying ? 'text-accent' : 'text-muted'}
                        />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-foreground text-sm" numberOfLines={1}>
                        {recording.description}
                    </Text>
                    <Text className="text-muted text-xs">
                        {formatDuration(recording.duration)}
                    </Text>
                </View>
            </Pressable>

            <Pressable
                onPress={() => onDelete?.(recording)}
                disabled={!onDelete}
                hitSlop={8}
                className="p-2"
                style={!onDelete ? { opacity: 0.3 } : undefined}
                accessibilityRole="button"
                accessibilityLabel="Delete recording"
                accessibilityState={{ disabled: !onDelete }}
            >
                <Icon name="trash-outline" size={20} className="text-danger" />
            </Pressable>
        </View>
    );
};

export default RecordingListItem;
