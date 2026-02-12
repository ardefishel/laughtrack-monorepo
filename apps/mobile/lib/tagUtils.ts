import { Database, Q } from '@nozbe/watermelondb';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { JokeTag, JOKE_TAGS_TABLE } from '@/models/JokeTag';

export function normalizeTag(input: string): string {
  return input.trim().replace(/^#/, '').toLowerCase();
}

export function parseTags(input: string): string[] {
  const parts = input.split(/[,\s]+/);
  const normalized = parts.map(normalizeTag).filter(Boolean);
  return [...new Set(normalized)];
}

export async function findOrCreateTag(database: Database, name: string): Promise<Tag> {
  const normalized = normalizeTag(name);
  if (!normalized) throw new Error('Tag name cannot be empty');

  const existing = await database
    .get<Tag>(TAGS_TABLE)
    .query(Q.where('name', normalized))
    .fetch();

  if (existing.length > 0) return existing[0];

  return await database.get<Tag>(TAGS_TABLE).create((record) => {
    record.name = normalized;
    record.createdAt = new Date();
    record.updatedAt = new Date();
  });
}

export async function attachTagToJoke(database: Database, jokeId: string, tagId: string): Promise<JokeTag> {
  const existing = await database
    .get<JokeTag>(JOKE_TAGS_TABLE)
    .query(Q.where('joke_id', jokeId), Q.where('tag_id', tagId))
    .fetch();

  if (existing.length > 0) return existing[0];

  return await database.get<JokeTag>(JOKE_TAGS_TABLE).create((record) => {
    record.jokeId = jokeId;
    record.tagId = tagId;
    record.createdAt = new Date();
    record.updatedAt = new Date();
  });
}

export async function detachTagFromJoke(database: Database, jokeId: string, tagId: string): Promise<void> {
  const existing = await database
    .get<JokeTag>(JOKE_TAGS_TABLE)
    .query(Q.where('joke_id', jokeId), Q.where('tag_id', tagId))
    .fetch();

  for (const record of existing) {
    await record.markAsDeleted();
  }
}

export async function getTagsForJoke(database: Database, jokeId: string): Promise<Tag[]> {
  const jokeTags = await database
    .get<JokeTag>(JOKE_TAGS_TABLE)
    .query(Q.where('joke_id', jokeId))
    .fetch();

  const tagIds = jokeTags.map((jt) => jt.tagId);
  if (tagIds.length === 0) return [];

  return await database
    .get<Tag>(TAGS_TABLE)
    .query(Q.where('id', Q.oneOf(tagIds)))
    .fetch();
}

export async function syncTagsForJoke(database: Database, jokeId: string, tagNames: string[]): Promise<void> {
  const normalizedNames = tagNames.map(normalizeTag).filter(Boolean);

  const currentTags = await getTagsForJoke(database, jokeId);
  const currentNames = currentTags.map((t) => t.name);

  const toAdd = normalizedNames.filter((n) => !currentNames.includes(n));
  const toRemove = currentTags.filter((t) => !normalizedNames.includes(t.name));

  for (const name of toAdd) {
    const tag = await findOrCreateTag(database, name);
    await attachTagToJoke(database, jokeId, tag.id);
  }

  for (const tag of toRemove) {
    await detachTagFromJoke(database, jokeId, tag.id);
  }
}
