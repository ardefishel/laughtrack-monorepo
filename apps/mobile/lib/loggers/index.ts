// Re-export from @laughtrack/logger for React Native
export {
  createNamespacedLogger,
  defaultLogger,
  dbLogger,
  hooksLogger,
  uiLogger,
  networkLogger,
  type LogLevel,
  type LogNamespace,
} from '@laughtrack/logger/react-native';

const isVerboseLoggingEnabled = (): boolean => {
  return __DEV__ && process.env.EXPO_PUBLIC_VERBOSE_LOGS === 'true';
};

const logVerbose = (logger: { debug: (...args: unknown[]) => void }, message: string, ...args: unknown[]): void => {
  if (isVerboseLoggingEnabled()) {
    logger.debug(message, ...args);
  }
};

export { isVerboseLoggingEnabled, logVerbose };
