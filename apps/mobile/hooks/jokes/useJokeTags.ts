import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@/context/DatabaseContext';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { JokeTag, JOKE_TAGS_TABLE } from '@/models/JokeTag';
import { findOrCreateTag, attachTagToJoke, detachTagFromJoke, normalizeTag } from '@/lib/tagUtils';
import { hooksLogger } from '@/lib/loggers';

export function useJokeTags(jokeId: string): {
  tags: string[];
  isLoading: boolean;
  addTag: (name: string) => Promise<void>;
  removeTag: (name: string) => Promise<void>;
} {
  const { database } = useDatabase();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jokeId) {
      setIsLoading(false);
      return;
    }

    hooksLogger.debug('[useJokeTags] Setting up observable for joke:', jokeId);

    const observable = database
      .get<JokeTag>(JOKE_TAGS_TABLE)
      .query(Q.where('joke_id', jokeId))
      .observe();

    const subscription = observable.subscribe({
      next: async (jokeTags: JokeTag[]) => {
        hooksLogger.debug('[useJokeTags] Observable emitted for:', jokeId, 'count:', jokeTags.length);
        try {
          const tagIds = jokeTags.map((jt) => jt.tagId);
          if (tagIds.length === 0) {
            setTags([]);
            setIsLoading(false);
            return;
          }
          const tagRecords = await database
            .get<Tag>(TAGS_TABLE)
            .query(Q.where('id', Q.oneOf(tagIds)))
            .fetch();
          setTags(tagRecords.map((t) => t.name));
          setIsLoading(false);
        } catch (err) {
          hooksLogger.error('[useJokeTags] Error fetching tags for:', jokeId, err);
          setIsLoading(false);
        }
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJokeTags] Observable error for:', jokeId, err);
        setIsLoading(false);
      }
    });

    return () => {
      hooksLogger.debug('[useJokeTags] Unsubscribing from:', jokeId);
      subscription.unsubscribe();
    };
  }, [database, jokeId]);

  const addTag = useCallback(
    async (name: string): Promise<void> => {
      hooksLogger.debug('[useJokeTags] Adding tag:', name, 'to joke:', jokeId);
      try {
        await database.write(async () => {
          const tag = await findOrCreateTag(database, name);
          await attachTagToJoke(database, jokeId, tag.id);
        });
      } catch (err) {
        hooksLogger.error('[useJokeTags] Error adding tag:', name, err);
      }
    },
    [database, jokeId]
  );

  const removeTag = useCallback(
    async (name: string): Promise<void> => {
      hooksLogger.debug('[useJokeTags] Removing tag:', name, 'from joke:', jokeId);
      try {
        const normalized = normalizeTag(name);
        const tagRecords = await database
          .get<Tag>(TAGS_TABLE)
          .query(Q.where('name', normalized))
          .fetch();
        if (tagRecords.length === 0) return;
        await database.write(async () => {
          await detachTagFromJoke(database, jokeId, tagRecords[0].id);
        });
      } catch (err) {
        hooksLogger.error('[useJokeTags] Error removing tag:', name, err);
      }
    },
    [database, jokeId]
  );

  return { tags, isLoading, addTag, removeTag };
}
