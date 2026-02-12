import type { JokeSetStatus, JokeStatus } from '@laughtrack/shared-types';

const JOKE_SET_STATUSES: readonly string[] = ['performed', 'bombed', 'killed'];

export function getJokeStatusDotClass(status: JokeStatus): string {
  switch (status) {
    case 'published':
      return 'bg-success';
    case 'draft':
      return 'bg-warning';
    case 'archived':
    default:
      return 'bg-muted';
  }
}

export function getJokeSetStatusDotClass(status: JokeSetStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-warning';
    case 'performed':
      return 'bg-accent';
    case 'bombed':
      return 'bg-danger';
    case 'killed':
      return 'bg-success';
    default:
      return 'bg-muted';
  }
}

export function getStatusDotClass(status: JokeStatus | JokeSetStatus): string {
  if (JOKE_SET_STATUSES.includes(status)) {
    return getJokeSetStatusDotClass(status as JokeSetStatus);
  }
  return getJokeStatusDotClass(status as JokeStatus);
}
