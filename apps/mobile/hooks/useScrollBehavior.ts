import { useEffect } from 'react';
import type { FlashListRef } from '@shopify/flash-list';
import { RawJoke } from '@/hooks/jokes';

interface UseScrollBehaviorOptions {
  flashListRef: React.RefObject<FlashListRef<RawJoke> | null>;
  itemCount: number;
  scrollToTopParam?: string;
  clearScrollParam: () => void;
}

interface UseScrollBehaviorReturn {
  triggerScrollToTop: () => void;
}

export function useScrollBehavior({
  flashListRef,
  itemCount,
  scrollToTopParam,
  clearScrollParam,
}: UseScrollBehaviorOptions): UseScrollBehaviorReturn {
  const triggerScrollToTop = () => {
    if (itemCount > 0) {
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  useEffect(() => {
    if (scrollToTopParam === 'true' && itemCount > 0) {
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
      clearScrollParam();
    }
  }, [scrollToTopParam, itemCount, flashListRef, clearScrollParam]);

  return { triggerScrollToTop };
}
