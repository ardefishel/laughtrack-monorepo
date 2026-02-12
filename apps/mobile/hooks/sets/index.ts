// This file is the main entry point for set-related hooks
// Import from '@/hooks/sets' instead of individual files

export { jokeSetToPlain, jokeSetItemToPlain, JOKE_SETS_TABLE, JOKE_SET_ITEMS_TABLE } from './transformers';
export { useJokeSetsQuery } from './useJokeSetsQuery';
export { useJokeSet } from './useJokeSet';
export { useCreateJokeSet } from './useCreateJokeSet';
export { useUpdateJokeSet } from './useUpdateJokeSet';
export { useDeleteJokeSet } from './useDeleteJokeSet';
export { useJokeSetItems } from './useJokeSetItems';
export { useAddJokeSetItem } from './useAddJokeSetItem';
export { useUpdateJokeSetItem } from './useUpdateJokeSetItem';
export { useRemoveJokeSetItem } from './useRemoveJokeSetItem';

// Re-export types from lib/types for convenience
export type {
  JokeSet,
  RawJokeSet,
  JokeSetStatus,
  JokeSetItem,
  RawJokeSetItem,
  JokeSetItemType,
} from '@laughtrack/shared-types';
