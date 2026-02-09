import { filterJokesBySearch, isValidJokeStatus, getStatusColor } from '@/lib/jokeUtils';
import type { Joke, JokeStatus } from '@/lib/types';

const mockJokes: Joke[] = [
  {
    id: '1',
    content_html: '<p>Why did the chicken cross the road?</p>',
    tags: ['chicken', 'classic'],
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recordings_count: 0,
  },
  {
    id: '2',
    content_html: '<p>A programmer walks into a bar...</p>',
    tags: ['programmer', 'bar'],
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recordings_count: 0,
  },
  {
    id: '3',
    content_html: '<p>Old joke that is no longer funny</p>',
    tags: ['old', 'archived'],
    status: 'archived',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recordings_count: 0,
  },
];

describe('filterJokesBySearch', () => {
  it('should return all jokes when search query is empty', () => {
    expect(filterJokesBySearch(mockJokes, '')).toEqual(mockJokes);
    expect(filterJokesBySearch(mockJokes, '   ')).toEqual(mockJokes);
  });

  it('should filter jokes by content', () => {
    const result = filterJokesBySearch(mockJokes, 'chicken');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter jokes by tags', () => {
    const result = filterJokesBySearch(mockJokes, 'programmer');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should be case insensitive', () => {
    const resultLower = filterJokesBySearch(mockJokes, 'chicken');
    const resultUpper = filterJokesBySearch(mockJokes, 'CHICKEN');
    expect(resultLower).toEqual(resultUpper);
  });

  it('should return empty array when no matches found', () => {
    const result = filterJokesBySearch(mockJokes, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should match partial content', () => {
    const result = filterJokesBySearch(mockJokes, 'road');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should match partial tags', () => {
    const result = filterJokesBySearch(mockJokes, 'prog');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should return multiple matches', () => {
    const jokesWithSimilarTags: Joke[] = [
      { ...mockJokes[0], tags: ['funny', 'test'], recordings_count: 0 },
      { ...mockJokes[1], tags: ['funny', 'joke'], recordings_count: 0 },
    ];
    const result = filterJokesBySearch(jokesWithSimilarTags, 'funny');
    expect(result).toHaveLength(2);
  });
});

describe('isValidJokeStatus', () => {
  it('should return true for valid statuses', () => {
    expect(isValidJokeStatus('draft')).toBe(true);
    expect(isValidJokeStatus('published')).toBe(true);
    expect(isValidJokeStatus('archived')).toBe(true);
  });

  it('should return false for invalid statuses', () => {
    expect(isValidJokeStatus('invalid')).toBe(false);
    expect(isValidJokeStatus('deleted')).toBe(false);
    expect(isValidJokeStatus('')).toBe(false);
  });

  it('should work as a type guard', () => {
    const status = 'published' as string;
    if (isValidJokeStatus(status)) {
      const typedStatus: JokeStatus = status;
      expect(typedStatus).toBe('published');
    }
  });
});

describe('getStatusColor', () => {
  it('should return success for published status', () => {
    expect(getStatusColor('published')).toBe('success');
  });

  it('should return warning for draft status', () => {
    expect(getStatusColor('draft')).toBe('warning');
  });

  it('should return default for archived status', () => {
    expect(getStatusColor('archived')).toBe('default');
  });
});
