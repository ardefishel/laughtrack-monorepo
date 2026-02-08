import { Joke } from './types';
import { filterJokesBySearch } from './jokeUtils';

export { filterJokesBySearch } from './jokeUtils';

export const mockJokes: Joke[] = [
  {
    id: '1',
    content_html: 'Why do programmers prefer dark mode?<br>Because light attracts bugs!',
    status: 'published',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    tags: ['programming', 'tech', 'puns'],
  },
  {
    id: '2',
    content_html: 'I told my computer I needed a break<br>and it said "no problem - I\'ll go to sleep".',
    status: 'published',
    created_at: '2024-01-20T14:45:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    tags: ['technology', 'humor'],
  },
  {
    id: '3',
    content_html: 'Why did the developer go broke?<br>Because they used up all their cache!',
    status: 'published',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
    tags: ['programming', 'money', 'tech'],
  },
  {
    id: '4',
    content_html: 'There are only 10 types of people in the world:<br>those who understand binary and those who don\'t.',
    status: 'published',
    created_at: '2024-02-10T16:20:00Z',
    updated_at: '2024-02-10T16:20:00Z',
    tags: ['math', 'nerdy', 'classic'],
  },
  {
    id: '5',
    content_html: 'Why do Java developers wear glasses?<br>Because they can\'t C!',
    status: 'published',
    created_at: '2024-02-15T11:00:00Z',
    updated_at: '2024-02-15T11:00:00Z',
    tags: ['programming', 'java', 'puns'],
  },
  {
    id: '6',
    content_html: 'A SQL query walks into a bar, approaches two tables and asks...<br>"Can I join you?"',
    status: 'published',
    created_at: '2024-02-20T13:30:00Z',
    updated_at: '2024-02-20T13:30:00Z',
    tags: ['programming', 'sql', 'database'],
  },
  {
    id: '7',
    content_html: 'Why was the JavaScript developer sad?<br>Because he didn\'t Node how to Express himself!',
    status: 'draft',
    created_at: '2024-02-25T08:45:00Z',
    updated_at: '2024-02-25T08:45:00Z',
    tags: ['programming', 'javascript', 'puns'],
  },
  {
    id: '8',
    content_html: 'I used to think I was indecisive,<br>but now I\'m not so sure.',
    status: 'published',
    created_at: '2024-03-01T15:10:00Z',
    updated_at: '2024-03-01T15:10:00Z',
    tags: ['wordplay', 'classic'],
  },
  {
    id: '9',
    content_html: 'Why did the scarecrow become a comedian?<br>Because he was outstanding in his field!',
    status: 'published',
    created_at: '2024-03-05T12:00:00Z',
    updated_at: '2024-03-05T12:00:00Z',
    tags: ['classic', 'puns', 'work'],
  },
  {
    id: '10',
    content_html: 'What do you call a fake noodle?<br>An impasta!',
    status: 'published',
    created_at: '2024-03-10T10:20:00Z',
    updated_at: '2024-03-10T10:20:00Z',
    tags: ['food', 'puns', 'dad-jokes'],
  },
];

// filterJokesBySearch is now exported from './jokeUtils'
