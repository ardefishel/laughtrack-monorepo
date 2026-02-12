import { useState, useEffect } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { hooksLogger, logVerbose } from '@/lib/loggers';

export function useAllTags(): {
  tags: string[];
  isLoading: boolean;
} {
  const { database } = useDatabase();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logVerbose(hooksLogger, '[useAllTags] Setting up tags observable');

    const observable = database
      .get<Tag>(TAGS_TABLE)
      .query()
      .observeWithColumns(['name']);

    const subscription = observable.subscribe({
      next: (tagRecords: Tag[]) => {
        const sorted = tagRecords
          .map((t) => t.name)
          .sort((a, b) => a.localeCompare(b));
        logVerbose(hooksLogger, '[useAllTags] Observable emitted, count:', sorted.length);
        setTags(sorted);
        setIsLoading(false);
      },
      error: (err: unknown) => {
        hooksLogger.error('[useAllTags] Observable error:', err);
        setIsLoading(false);
      }
    });

    return () => {
      logVerbose(hooksLogger, '[useAllTags] Unsubscribing');
      subscription.unsubscribe();
    };
  }, [database]);

  return { tags, isLoading };
}
