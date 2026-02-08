import { useMemo } from 'react';
import { useJokeSetItems } from './sets';
import { useJokesQuery } from './jokes';
import { stripHtmlWrapper, combineHtmlContents } from '@/lib/htmlParser';

/**
 * Hook that gets joke set items with their combined HTML content
 * @param setId - The ID of the joke set
 * @returns Object containing combined HTML content and loading state
 */
export function useJokeSetItemsWithHtml(setId: string): {
  combinedHtml: string;
  isLoading: boolean;
  error: Error | null;
} {
  const { items, isLoading: itemsLoading, error: itemsError } = useJokeSetItems(setId);
  const { jokes, isLoading: jokesLoading, error: jokesError } = useJokesQuery();

  const combinedHtml = useMemo(() => {
    if (!items || !jokes) return '';

    const contents: string[] = [];

    for (const item of items) {
      if (item.item_type === 'joke' && item.joke_id) {
        const joke = jokes.find((j) => j.id === item.joke_id);
        if (joke?.content_html) {
          const stripped = stripHtmlWrapper(joke.content_html);
          if (stripped) {
            contents.push(stripped);
          }
        }
      } else if (item.item_type === 'note' && item.content) {
        contents.push(item.content);
      }
    }

    const result = combineHtmlContents(contents);
    console.log('[Reader] Combined HTML:', result);
    return result;
  }, [items, jokes]);

  return {
    combinedHtml,
    isLoading: itemsLoading || jokesLoading,
    error: itemsError || jokesError || null,
  };
}
