import { SortableListItem } from '@/components/ui/SortableListItem';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export interface SetNoteItem {
  id: string;
  title?: string;
  content?: string;
}

export interface SortableNoteItemProps {
  note: SetNoteItem;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function SortableNoteItem({ note, isActive, onPress, onLongPress }: SortableNoteItemProps) {
  return (
    <SortableListItem
      isActive={isActive}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View className="flex-row items-start flex-1">
        <StyledIonicons
          name="document-text"
          size={18}
          className={isActive ? 'text-accent' : 'text-secondary'}
          style={{ marginRight: 12, marginTop: 2 }}
        />
        <View className="flex-1">
          <Text className="text-foreground text-base font-medium" numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>
          {note.content && (
            <Text className="text-muted text-sm mt-1" numberOfLines={2}>
              {note.content}
            </Text>
          )}
        </View>
      </View>
    </SortableListItem>
  );
}
