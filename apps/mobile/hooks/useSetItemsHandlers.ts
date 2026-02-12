import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Joke } from '@laughtrack/shared-types';
import { SetJokeItem } from '@/lib/mocks';
import { useSetEditing } from '@/context/SetEditingContext';
import { uiLogger } from '@/lib/loggers';

interface UseSetItemHandlersOptions {
  setId?: string;
  onAddNote?: (afterId?: string | null) => Promise<void> | void;
  onDragEnd?: ({ data }: { data: SetJokeItem[] }) => Promise<void> | void;
  onDeleteItem?: (itemId: string) => Promise<void> | void;
}

interface UseSetItemHandlersReturn {
  expandedSeparatorId: string | null;
  handleAddJoke: (afterId?: string | null) => void;
  handleAddNote: (afterId?: string | null) => Promise<void>;
  handleSeparatorPress: (separatorId: string) => void;
  handleDismiss: () => void;
  handleJokePress: (joke: Joke) => void;
  handleDragEnd: ({ data }: { data: SetJokeItem[] }) => void;
  handleDeleteItem: (itemId: string) => void;
}

export function useSetItemsHandlers(options: UseSetItemHandlersOptions): UseSetItemHandlersReturn {
  const { setId, onAddNote, onDragEnd, onDeleteItem } = options;
  const router = useRouter();
  const { mode, setPendingAddPosition } = useSetEditing();
  const [expandedSeparatorId, setExpandedSeparatorId] = useState<string | null>(null);

  const handleAddJoke = useCallback((afterId?: string | null) => {
    setPendingAddPosition(afterId);
    if (mode === 'edit' && setId) {
      router.push(`/sets/${setId}/select-jokes` as const);
    } else {
      router.push('/sets/new/select-jokes' as const);
    }
    setExpandedSeparatorId(null);
  }, [setPendingAddPosition, router, mode, setId]);

  const handleAddNote = useCallback(async (afterId?: string | null) => {
    if (onAddNote) {
      await onAddNote(afterId);
    }
    setExpandedSeparatorId(null);
  }, [onAddNote]);

  const handleSeparatorPress = useCallback((separatorId: string) => {
    setExpandedSeparatorId((current) =>
      current === separatorId ? null : separatorId
    );
  }, []);

  const handleDismiss = useCallback(() => {
    setExpandedSeparatorId(null);
  }, []);

  const handleJokePress = useCallback((joke: Joke) => {
    uiLogger.debug(`[${mode === 'edit' ? 'SetDetailScreen' : 'NewSetScreen'}] Joke pressed:`, joke.id);
  }, [mode]);

  const handleDragEnd = useCallback(({ data }: { data: SetJokeItem[] }) => {
    if (onDragEnd) {
      onDragEnd({ data });
    }
  }, [onDragEnd]);

  const handleDeleteItem = useCallback((itemId: string) => {
    uiLogger.debug(`[${mode === 'edit' ? 'SetDetailScreen' : 'NewSetScreen'}] Deleting item:`, itemId);
    if (onDeleteItem) {
      onDeleteItem(itemId);
    }
  }, [onDeleteItem, mode]);

  return {
    expandedSeparatorId,
    handleAddJoke,
    handleAddNote,
    handleSeparatorPress,
    handleDismiss,
    handleJokePress,
    handleDragEnd,
    handleDeleteItem,
  };
}
