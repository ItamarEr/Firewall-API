
import { config } from './env';
import winston from 'winston';

// Determine log level based on environment
const level = config.ENV === 'production' ? 'info' : 'debug';

// Winston logger setup
const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Initialization
function safeLog(method: keyof typeof logger, ...args: any[]) {
  try {
    logger[method](args.map(String).join(' '));
  } catch (err) {
    // console if logger fails
    console.info('[LOGGER ERROR]', err, ...args);
  }
}

const LoggerSingleton = {
  debug: (...args: any[]) => safeLog('debug', ...args),
  info: (...args: any[]) => safeLog('info', ...args),
  warn: (...args: any[]) => safeLog('warn', ...args),
  error: (...args: any[]) => safeLog('error', ...args),
  getInstance: () => LoggerSingleton,
};

// Overwrite standard console methods
console.log = (...args: any[]) => LoggerSingleton.info(...args);
console.error = (...args: any[]) => LoggerSingleton.error(...args);
console.warn = (...args: any[]) => LoggerSingleton.warn(...args);
console.debug = (...args: any[]) => LoggerSingleton.debug(...args);

export default LoggerSingleton;
