import { useDatabase } from '@/context/DatabaseContext';
import { hooksLogger, logVerbose } from '@/lib/loggers';
import { JOKE_TAGS_TABLE, JokeTag } from '@/models/JokeTag';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useAllTags(): {
  tags: string[];
  isLoading: boolean;
} {
  const { database } = useDatabase();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logVerbose(hooksLogger, '[useAllTags] Setting up joke-tags observable');

    // Observe the joke_tags table so we react to tags being added/removed from jokes
    const observable = database
      .get<JokeTag>(JOKE_TAGS_TABLE)
      .query()
      .observe();

    const subscription = observable.subscribe({
      next: async (jokeTagRecords: JokeTag[]) => {
        try {
          // Get unique tag IDs that are actually used by jokes
          const usedTagIds = [...new Set(jokeTagRecords.map((jt) => jt.tagId))];

          if (usedTagIds.length === 0) {
            logVerbose(hooksLogger, '[useAllTags] No tags in use');
            setTags([]);
            setIsLoading(false);
            return;
          }

          // Fetch only the tags that are actually attached to jokes
          const tagRecords = await database
            .get<Tag>(TAGS_TABLE)
            .query(Q.where('id', Q.oneOf(usedTagIds)))
            .fetch();

          const sorted = tagRecords
            .map((t) => t.name)
            .sort((a, b) => a.localeCompare(b));
          logVerbose(hooksLogger, '[useAllTags] Tags in use, count:', sorted.length);
          setTags(sorted);
          setIsLoading(false);
        } catch (err) {
          hooksLogger.error('[useAllTags] Error fetching used tags:', err);
          setIsLoading(false);
        }
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
