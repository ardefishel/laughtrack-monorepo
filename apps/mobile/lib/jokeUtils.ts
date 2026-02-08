import { Joke, JokeStatus } from './types';

/**
 * Filters jokes by search query (matches content or tags)
 * @param jokes - Array of jokes to filter
 * @param searchQuery - Search string to match against
 * @returns Filtered array of jokes
 */
export function filterJokesBySearch(jokes: Joke[], searchQuery: string): Joke[] {
  if (!searchQuery.trim()) return jokes;

  const query = searchQuery.toLowerCase().trim();
  return jokes.filter(
    (joke) =>
      joke.content_html.toLowerCase().includes(query) ||
      joke.tags.some((tag) => tag.toLowerCase().includes(query))
  );
}

/**
 * Type guard to check if a string is a valid JokeStatus
 * @param status - String to check
 * @returns True if status is a valid JokeStatus
 */
export function isValidJokeStatus(status: string): status is JokeStatus {
  return ['draft', 'published', 'archived'].includes(status);
}

/**
 * Gets the color theme for a joke status
 * @param status - Joke status
 * @returns Color name for the status
 */
export function getStatusColor(status: JokeStatus): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'published':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
    default:
      return 'default';
  }
}
