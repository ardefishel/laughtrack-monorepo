import { logger, type transportFunctionType } from 'react-native-logs';
import type { LogLevel, LogNamespace, Logger } from '../types';

declare const __DEV__: boolean;

const PRODUCTION_LOG_LEVEL: LogLevel = 'warn';
const DEVELOPMENT_LOG_LEVEL: LogLevel = 'debug';

const getLogLevel = (): LogLevel => {
  return typeof __DEV__ !== 'undefined' && __DEV__ ? DEVELOPMENT_LOG_LEVEL : PRODUCTION_LOG_LEVEL;
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

const customTransport: transportFunctionType<Record<string, never>> = (props) => {
  const { rawMsg, level, extension } = props;
  const timestamp = formatTimestamp();
  const namespace = extension?.toUpperCase() || 'DEFAULT';

  const formattedMsg = formatMessage(rawMsg);
  const output = `[${timestamp}] [${namespace}] ${formattedMsg}`;

  switch (level.text) {
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

export function createNamespacedLogger(namespace: LogNamespace): Logger {
  return logger.createLogger({
    severity: getLogLevel(),
    transport: customTransport,
    enabledExtensions: [namespace],
  }).extend(namespace) as unknown as Logger;
}

export const defaultLogger: Logger = logger.createLogger({
  severity: getLogLevel(),
  transport: customTransport,
}) as unknown as Logger;

export const dbLogger = createNamespacedLogger('db');
export const hooksLogger = createNamespacedLogger('hooks');
export const uiLogger = createNamespacedLogger('ui');
export const networkLogger = createNamespacedLogger('network');

export type { LogLevel, LogNamespace } from '../types';
