import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import type { RawJokeSet } from '@/lib/types';
import { formatTimeAgo } from '@/lib/dateUtils';
import { StatusBadge } from '@/components/ui/StatusBadge';

const StyledIonicons = withUniwind(Ionicons);

interface SetCardProps {
  jokeSet: RawJokeSet;
  onPress: (jokeSet: RawJokeSet) => void;
}

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function SetCardComponent({ jokeSet, onPress }: SetCardProps) {
  const handlePress = () => {
    onPress(jokeSet);
  };

  const duration = formatDuration(jokeSet.duration);

  return (
    <Pressable onPress={handlePress} className="mx-4 mb-3" accessibilityRole="button" accessibilityLabel={jokeSet.title || 'Untitled Set'}>
      <Card className="p-3 bg-surface">
        <Text className="text-foreground text-lg font-semibold leading-snug" numberOfLines={1}>
          {jokeSet.title || 'Untitled Set'}
        </Text>

        {jokeSet.description && jokeSet.description.length > 0 && (
          <Text className="text-muted text-sm leading-relaxed mt-1" numberOfLines={2}>
            {jokeSet.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-3">
            <StatusBadge status={jokeSet.status} showDot size="sm" />
            
            {duration && (
              <View className="flex-row items-center gap-1">
                <StyledIonicons name="time-outline" size={12} className="text-muted/60" />
                <Text className="text-xs text-muted/70">{duration}</Text>
              </View>
            )}

            {jokeSet.place && jokeSet.place.length > 0 && (
              <View className="flex-row items-center gap-1">
                <StyledIonicons name="location-outline" size={12} className="text-muted/60" />
                <Text className="text-xs text-muted/70" numberOfLines={1}>
                  {jokeSet.place}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-muted text-xs">
            {formatTimeAgo(jokeSet.created_at)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export const SetCard = memo(SetCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.jokeSet.id === nextProps.jokeSet.id &&
    prevProps.jokeSet.title === nextProps.jokeSet.title &&
    prevProps.jokeSet.description === nextProps.jokeSet.description &&
    prevProps.jokeSet.status === nextProps.jokeSet.status &&
    prevProps.jokeSet.duration === nextProps.jokeSet.duration &&
    prevProps.jokeSet.place === nextProps.jokeSet.place &&
    prevProps.jokeSet.updated_at === nextProps.jokeSet.updated_at
  );
});
