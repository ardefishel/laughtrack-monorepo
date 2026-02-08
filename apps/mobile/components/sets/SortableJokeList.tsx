import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import { Joke } from '@/lib/types';
import { SetJokeItem } from '@/lib/mockData';
import { SortableList } from '@/components/ui/SortableList';
import { AddItemSeparator } from '@/components/ui/AddItemSeparator';
import { AddItemButton } from '@/components/ui/AddItemButton';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { SortableJokeItem } from './SortableJokeItem';
import { SortableNoteItem } from './SortableNoteItem';

interface SortableJokeListProps {
  items: SetJokeItem[];
  onJokePress?: (joke: Joke) => void;
  onAddJoke?: (afterId?: string | null) => void;
  onAddNote?: (afterId?: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
  onDragEnd?: ({ data }: { data: SetJokeItem[] }) => void;
  expandedSeparatorId: string | null;
  onSeparatorPress: (id: string) => void;
  onDismiss: () => void;
}

export function SortableJokeList({
  items,
  onJokePress,
  onAddJoke,
  onAddNote,
  onDeleteItem,
  onDragEnd: externalOnDragEnd,
  expandedSeparatorId,
  onSeparatorPress,
  onDismiss,
}: SortableJokeListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const { height: windowHeight } = useWindowDimensions();

  const handleDragBegin = useCallback(() => {
    isDraggingRef.current = true;
    setIsDragging(true);
    onDismiss();
  }, [onDismiss]);

  const handleDragEnd = useCallback(({ data }: { data: SetJokeItem[] }) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    externalOnDragEnd?.({ data });
  }, [externalOnDragEnd]);

  const handleItemPress = useCallback(() => {
    if (expandedSeparatorId) {
      onDismiss();
    }
  }, [expandedSeparatorId, onDismiss]);

  const lastItemId = useMemo(() => items[items.length - 1]?.id, [items]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<SetJokeItem>) => {
      const isLastItem = item.id === lastItemId;
      const currentlyDragging = isDraggingRef.current || isDragging;
      const isExpanded = expandedSeparatorId === item.id && !currentlyDragging;

      const handlePress = () => {
        handleItemPress();
        if (item.type === 'joke') {
          onJokePress?.({
            id: item.id,
            content_html: '',
            status: item.status || 'draft',
            created_at: '',
            updated_at: '',
            tags: [],
          });
        }
      };

      const handleLongPress = () => {
        handleItemPress();
        drag();
      };

      return (
        <View>
          <SwipeableRow
            onDelete={() => onDeleteItem?.(item.id)}
            enabled={!isActive && !!onDeleteItem}
          >
            {item.type === 'note' ? (
              <SortableNoteItem
                note={{ id: item.id, title: item.title, content: item.content }}
                isActive={isActive}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            ) : (
              <SortableJokeItem
                joke={{
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  status: item.status,
                }}
                isActive={isActive}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            )}
          </SwipeableRow>

          {!isLastItem && (
            <AddItemSeparator
              isVisible={!currentlyDragging}
              isExpanded={isExpanded}
              onPress={() => {
                handleItemPress();
                onSeparatorPress(item.id);
              }}
              onAddJoke={() => {
                onAddJoke?.(item.id);
                onDismiss();
              }}
              onAddNote={() => {
                onAddNote?.(item.id);
                onDismiss();
              }}
            />
          )}
        </View>
      );
    },
    [isDragging, expandedSeparatorId, onJokePress, onAddJoke, onAddNote, onDeleteItem, onSeparatorPress, onDismiss, handleItemPress, lastItemId]
  );

  const isTopExpanded = expandedSeparatorId === 'add-top' && !isDragging;
  const isBottomExpanded = expandedSeparatorId === 'add-bottom' && !isDragging;

  const renderTopButton = useCallback(() => {
    return (
      <AddItemButton
        position="top"
        isExpanded={isTopExpanded}
        onPress={() => onSeparatorPress('add-top')}
        onAddJoke={() => {
          onAddJoke?.(null);
          onDismiss();
        }}
        onAddNote={() => {
          onAddNote?.(null);
          onDismiss();
        }}
      />
    );
  }, [isTopExpanded, onAddJoke, onAddNote, onDismiss, onSeparatorPress]);

  const renderBottomButton = useCallback(() => {
    return (
      <View>
        <AddItemButton
          position="bottom"
          isExpanded={isBottomExpanded}
          onPress={() => onSeparatorPress('add-bottom')}
          onAddJoke={() => {
            onAddJoke?.('add-bottom');
            onDismiss();
          }}
          onAddNote={() => {
            onAddNote?.('add-bottom');
            onDismiss();
          }}
        />
        <View style={{ minHeight: windowHeight * 0.5 }} className="flex-1" />
      </View>
    );
  }, [isBottomExpanded, onAddJoke, onAddNote, onDismiss, onSeparatorPress, windowHeight]);

  const renderPlaceholder = useCallback(() => {
    return <View className="bg-default/30 rounded-lg mx-2 flex-1" />;
  }, []);

  return (
    <SortableList
      data={items}
      onDragBegin={handleDragBegin}
      onDragEnd={handleDragEnd}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderPlaceholder={renderPlaceholder}
      ListHeaderComponent={renderTopButton}
      ListFooterComponent={renderBottomButton}
    />
  );
}
