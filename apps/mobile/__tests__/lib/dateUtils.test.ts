import { formatTimeAgo } from '@/lib/dateUtils';

describe('formatTimeAgo', () => {
  const now = Date.now();

  it('should return "just now" for timestamps within 5 seconds', () => {
    expect(formatTimeAgo(now - 1000)).toBe('just now');
    expect(formatTimeAgo(now - 4000)).toBe('just now');
  });

  it('should return seconds ago for timestamps within 1 minute', () => {
    expect(formatTimeAgo(now - 10000)).toBe('10s ago');
    expect(formatTimeAgo(now - 30000)).toBe('30s ago');
    expect(formatTimeAgo(now - 59000)).toBe('59s ago');
  });

  it('should return minutes ago for timestamps within 1 hour', () => {
    expect(formatTimeAgo(now - 60000)).toBe('1m ago');
    expect(formatTimeAgo(now - 300000)).toBe('5m ago');
    expect(formatTimeAgo(now - 3540000)).toBe('59m ago');
  });

  it('should return hours ago for timestamps within 1 day', () => {
    expect(formatTimeAgo(now - 3600000)).toBe('1h ago');
    expect(formatTimeAgo(now - 7200000)).toBe('2h ago');
    expect(formatTimeAgo(now - 82800000)).toBe('23h ago');
  });

  it('should return days ago for timestamps within 1 week', () => {
    expect(formatTimeAgo(now - 86400000)).toBe('1d ago');
    expect(formatTimeAgo(now - 172800000)).toBe('2d ago');
    expect(formatTimeAgo(now - 518400000)).toBe('6d ago');
  });

  it('should return weeks ago for timestamps within 1 month', () => {
    expect(formatTimeAgo(now - 604800000)).toBe('1w ago');
    expect(formatTimeAgo(now - 1209600000)).toBe('2w ago');
    expect(formatTimeAgo(now - 1814400000)).toBe('3w ago');
  });

  it('should return months ago for timestamps within 1 year', () => {
    expect(formatTimeAgo(now - 2592000000)).toBe('1mo ago');
    expect(formatTimeAgo(now - 7776000000)).toBe('3mo ago');
    expect(formatTimeAgo(now - 28944000000)).toBe('11mo ago');
  });

  it('should return years ago for timestamps over 1 year', () => {
    expect(formatTimeAgo(now - 31536000000)).toBe('1y ago');
    expect(formatTimeAgo(now - 63072000000)).toBe('2y ago');
    expect(formatTimeAgo(now - 157680000000)).toBe('5y ago');
  });
});
