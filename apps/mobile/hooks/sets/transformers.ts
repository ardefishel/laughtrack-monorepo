import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import type { RawJokeSet, RawJokeSetItem } from '@laughtrack/shared-types';

/**
 * Transforms a WatermelonDB JokeSet model to a plain RawJokeSet object
 * @param jokeSet - WatermelonDB JokeSet model instance
 * @returns Plain RawJokeSet object with numeric timestamps
 */
export function jokeSetToPlain(jokeSet: JokeSet): RawJokeSet {
  return {
    id: jokeSet.id,
    title: jokeSet.title,
    description: jokeSet.description,
    duration: jokeSet.duration,
    place: jokeSet.place,
    status: jokeSet.status,
    created_at: jokeSet.created_at.getTime(),
    updated_at: jokeSet.updated_at.getTime(),
  };
}

/**
 * Transforms a WatermelonDB JokeSetItem model to a plain RawJokeSetItem object
 * @param item - WatermelonDB JokeSetItem model instance
 * @returns Plain RawJokeSetItem object with numeric timestamps
 */
export function jokeSetItemToPlain(item: JokeSetItem): RawJokeSetItem {
  return {
    id: item.id,
    set_id: item.setId,
    item_type: item.itemType,
    joke_id: item.jokeId,
    content: item.content,
    position: item.position,
    created_at: item.created_at.getTime(),
    updated_at: item.updated_at.getTime(),
  };
}

export { JOKE_SETS_TABLE, JOKE_SET_ITEMS_TABLE };
