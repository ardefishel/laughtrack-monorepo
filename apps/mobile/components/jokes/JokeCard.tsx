import { AudioIndicator } from '@/components/audio/AudioIndicator';
import { MinimalStatusIndicator } from '@/components/ui/MinimalStatusIndicator';
import { formatTimeAgo } from '@/lib/dateUtils';
import { extractTitleAndDescription } from '@/lib/htmlParser';
import { Joke as JokeType } from '@/lib/types';
import { Card, Separator } from 'heroui-native';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

interface JokeCardProps {
  joke: JokeType & { created_at: string | number; updated_at: string | number; draft_updated_at?: string | number; recordings_count?: number };
  onPress: (joke: JokeType) => void;
}

function JokeCardComponent({ joke, onPress }: JokeCardProps) {
  const { title, description } = extractTitleAndDescription(joke.content_html);
  const recordingCount = joke.recordings_count ?? 0;

  const handlePress = () => {
    onPress({
      id: joke.id,
      content_html: joke.content_html,
      status: joke.status,
      created_at: typeof joke.created_at === 'number'
        ? new Date(joke.created_at).toISOString()
        : joke.created_at,
      updated_at: typeof joke.updated_at === 'number'
        ? new Date(joke.updated_at).toISOString()
        : joke.updated_at,
      tags: joke.tags,
      recordings_count: recordingCount,
    });
  };

  return (
    <Pressable onPress={handlePress} className="mx-4 mb-3">
      <Card className="p-4 bg-surface">
        <View className="flex-row items-start justify-between">
          <Text className="text-foreground text-lg font-semibold leading-snug flex-1 pr-2" numberOfLines={1}>
            {title || 'Untitled Joke'}
          </Text>
          <MinimalStatusIndicator status={joke.status} />
        </View>

        {description.length > 0 && (
          <Text className="text-muted text-sm leading-relaxed mt-1" numberOfLines={2}>
            {description}
          </Text>
        )}

        <Separator className='my-2 bg-default/70' thickness={1} />

        <View className="flex-row items-center justify-between">
          {recordingCount > 0 ? (
            <AudioIndicator recordingCount={recordingCount} />
          ) : (
            <View />
          )}

          <Text className="text-muted text-xs">
            {formatTimeAgo(typeof joke.created_at === 'string' ? new Date(joke.created_at).getTime() : joke.created_at)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export const JokeCard = memo(JokeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.joke.id === nextProps.joke.id &&
    prevProps.joke.content_html === nextProps.joke.content_html &&
    prevProps.joke.status === nextProps.joke.status &&
    prevProps.joke.updated_at === nextProps.joke.updated_at &&
    prevProps.joke.draft_updated_at === nextProps.joke.draft_updated_at &&
    prevProps.joke.recordings_count === nextProps.joke.recordings_count
  );
});
