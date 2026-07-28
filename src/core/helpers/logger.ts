type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const print = (level: LogLevel, ...args: unknown[]) => {
  if (__DEV__) {
    console[level](...args);
  }
};

export const Logger = {
  debug: (...args: unknown[]) => print('debug', ...args),

  info: (...args: unknown[]) => print('info', ...args),

  warn: (...args: unknown[]) => print('warn', ...args),

  error: (...args: unknown[]) => print('error', ...args),
};