import { useState, useEffect, useMemo } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@/context/DatabaseContext';
import { useJokeSetItems } from './sets';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { stripHtmlWrapper, combineHtmlContents } from '@/lib/htmlParser';
import { createNamespacedLogger } from '@/lib/loggers';

const hooksLogger = createNamespacedLogger('hooks');

export function useJokeSetItemsWithHtml(setId: string): {
  combinedHtml: string;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const { items, isLoading: itemsLoading, error: itemsError } = useJokeSetItems(setId);
  const [jokeMap, setJokeMap] = useState<Map<string, string>>(new Map());
  const [jokesLoading, setJokesLoading] = useState(false);
  const [jokesError, setJokesError] = useState<Error | null>(null);

  const jokeIds = useMemo(() => {
    if (!items) return [];
    return items
      .filter(item => item.item_type === 'joke' && item.joke_id)
      .map(item => item.joke_id!);
  }, [items]);

  useEffect(() => {
    if (jokeIds.length === 0) {
      setJokeMap(new Map());
      return;
    }

    setJokesLoading(true);

    const subscription = database
      .get<Joke>(JOKES_TABLE)
      .query(Q.where('id', Q.oneOf(jokeIds)))
      .observe()
      .subscribe({
        next: (jokes: Joke[]) => {
          const map = new Map<string, string>();
          for (const joke of jokes) {
            if (joke.content_html) {
              map.set(joke.id, joke.content_html);
            }
          }
          setJokeMap(map);
          setJokesLoading(false);
          setJokesError(null);
        },
        error: (err: unknown) => {
          hooksLogger.error('[useJokeSetItemsWithHtml] Error fetching jokes:', err);
          setJokesError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
          setJokesLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [database, jokeIds]);

  const combinedHtml = useMemo(() => {
    if (!items) return '';

    const contents: string[] = [];

    for (const item of items) {
      if (item.item_type === 'joke' && item.joke_id) {
        const contentHtml = jokeMap.get(item.joke_id);
        if (contentHtml) {
          const stripped = stripHtmlWrapper(contentHtml);
          if (stripped) {
            contents.push(stripped);
          }
        }
      } else if (item.item_type === 'note' && item.content) {
        contents.push(item.content);
      }
    }

    const result = combineHtmlContents(contents);
    hooksLogger.debug('[useJokeSetItemsWithHtml] Combined HTML:', result);
    return result;
  }, [items, jokeMap]);

  return {
    combinedHtml,
    isLoading: itemsLoading || jokesLoading,
    error: itemsError || jokesError || null,
  };
}
