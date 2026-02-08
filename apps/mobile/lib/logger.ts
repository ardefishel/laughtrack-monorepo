import { logger, type transportFunctionType } from 'react-native-logs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogNamespace = 'db' | 'hooks' | 'ui' | 'network' | 'audio' | 'default';

const PRODUCTION_LOG_LEVEL: LogLevel = 'warn';
const DEVELOPMENT_LOG_LEVEL: LogLevel = 'debug';

const getLogLevel = (): LogLevel => {
  return __DEV__ ? DEVELOPMENT_LOG_LEVEL : PRODUCTION_LOG_LEVEL;
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const customTransport: transportFunctionType<Record<string, never>> = (props) => {
  const { rawMsg, level, extension } = props;
  const timestamp = formatTimestamp();
  const namespace = extension?.toUpperCase() || 'DEFAULT';
  
  const formattedMsg = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
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

export function createNamespacedLogger(namespace: LogNamespace) {
  return logger.createLogger({
    severity: getLogLevel(),
    transport: customTransport,
    enabledExtensions: [namespace],
  }).extend(namespace);
}

export const defaultLogger = logger.createLogger({
  severity: getLogLevel(),
  transport: customTransport,
});

export const dbLogger = createNamespacedLogger('db');
export const hooksLogger = createNamespacedLogger('hooks');
export const uiLogger = createNamespacedLogger('ui');
export const networkLogger = createNamespacedLogger('network');

export type { LogLevel, LogNamespace };
