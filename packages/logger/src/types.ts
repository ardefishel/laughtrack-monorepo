export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogNamespace = 'db' | 'hooks' | 'ui' | 'network' | 'audio' | 'default';

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}
