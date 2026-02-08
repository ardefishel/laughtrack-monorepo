import React from 'react';
import { Text, View } from 'react-native';
import { SortableListItem } from '@/components/ui/SortableListItem';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface SetJokeItem {
  id: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface SortableJokeItemProps {
  joke: SetJokeItem;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function SortableJokeItem({ joke, isActive, onPress, onLongPress }: SortableJokeItemProps) {
  return (
    <SortableListItem
      isActive={isActive}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View className="flex-1 mr-3">
        <Text className="text-foreground text-base font-medium" numberOfLines={1}>
          {joke.title || 'Untitled Joke'}
        </Text>
        {joke.description && (
          <Text className="text-muted text-sm mt-0.5" numberOfLines={1}>
            {joke.description}
          </Text>
        )}
      </View>
      <StatusBadge status={joke.status || 'draft'} showDot size="sm" />
    </SortableListItem>
  );
}
