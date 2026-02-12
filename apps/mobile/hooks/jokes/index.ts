// This file is the main entry point for joke-related hooks
// Import from '@/hooks/jokes' instead of '@/hooks/useJokes'

export { jokeToPlain, fetchRecordingCounts } from './transformers';
export { useJokesQuery } from './useJokesQuery';
export { useJoke } from './useJoke';
export { useCreateJoke } from './useCreateJoke';
export { useUpdateJoke } from './useUpdateJoke';
export { useDeleteJoke } from './useDeleteJoke';
export { useJokeTags } from './useJokeTags';
export { useAllTags } from './useAllTags';

// Re-export types from lib/types for convenience
export type { RawJoke, Joke, JokeStatus, JokeWithUnifiedDates } from '@laughtrack/shared-types';
