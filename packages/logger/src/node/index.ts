import type { LogLevel, LogNamespace, Logger } from '../types';

const PRODUCTION_LOG_LEVEL: LogLevel = 'warn';
const DEVELOPMENT_LOG_LEVEL: LogLevel = 'debug';

const getLogLevel = (): LogLevel => {
  return process.env.NODE_ENV === 'production' ? PRODUCTION_LOG_LEVEL : DEVELOPMENT_LOG_LEVEL;
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMessage = (msg: unknown): string => {
  if (typeof msg === 'string') {
    return msg;
  }
  if (msg instanceof Error) {
    return `${msg.name}: ${msg.message}${msg.stack ? `\n${msg.stack}` : ''}`;
  }
  if (typeof msg === 'object' && msg !== null) {
    try {
      return JSON.stringify(msg, Object.getOwnPropertyNames(msg));
    } catch {
      return String(msg);
    }
  }
  return String(msg);
};

interface LogEntry {
  timestamp: string;
  namespace: string;
  level: LogLevel;
  message: string;
}

const logToConsole = (entry: LogEntry): void => {
  const output = `[${entry.timestamp}] [${entry.namespace}] ${entry.message}`;

  switch (entry.level) {
    case 'debug':
      console.debug(output);
      break;
    case 'info':
      console.info(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
    default:
      console.log(output);
  }
};

class NodeLogger implements Logger {
  private namespace: string;
  private logLevel: LogLevel;

  constructor(namespace: LogNamespace, logLevel: LogLevel = getLogLevel()) {
    this.namespace = namespace.toUpperCase();
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const message = args.map(formatMessage).join(' ');
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      namespace: this.namespace,
      level,
      message,
    };

    logToConsole(entry);
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }
}

export function createNamespacedLogger(namespace: LogNamespace): Logger {
  return new NodeLogger(namespace);
}

export const defaultLogger: Logger = new NodeLogger('default');
export const dbLogger = createNamespacedLogger('db');
export const hooksLogger = createNamespacedLogger('hooks');
export const uiLogger = createNamespacedLogger('ui');
export const networkLogger = createNamespacedLogger('network');

export type { LogLevel, LogNamespace } from '../types';
