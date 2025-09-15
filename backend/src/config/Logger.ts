import winston from 'winston';
import Transport from 'winston-transport';
import { config } from './env';

const { ENV } = config;

// Format: timestamp, level, message, and stack if error
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);


let transports: winston.transport[] = [];
let level = 'debug';

// In-memory log array for dev
const devLogs: string[] = [];
const MAX_DEV_LOGS = 200;

// Custom Winston transport for devLogs (Winston v3+)
class DevLogTransport extends Transport {
  log(info: any, callback: () => void) {
    setImmediate(() => {
      const { timestamp, level, message, stack } = info;
      const msg = `${timestamp || new Date().toISOString()} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
      devLogs.push(msg);
      if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();
    });
    callback();
  }
}

try {
  if (ENV === 'production') {
    transports.push(
      new winston.transports.File({ filename: 'app.log', level: 'info', format: logFormat })
    );
    level = 'info';
  } else {
    transports.push(
      new winston.transports.Console({ format: logFormat })
    );
    transports.push(new DevLogTransport());
    level = 'debug';
  }
} catch (err) {
  // Fallback to console if file transport fails
  transports = [new winston.transports.Console({ format: logFormat })];
  level = 'debug';
  console.error('Logger initialization failed, falling back to console:', err);
}

class LoggerSingleton {
  private static instance: winston.Logger;
  private static initialized = false;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!LoggerSingleton.instance) {
      LoggerSingleton.instance = winston.createLogger({
        level,
        format: logFormat,
        transports,
      });
      if (!LoggerSingleton.initialized) {
        // Overwrite console methods
        console.log = (...args: any[]) => {
          LoggerSingleton.instance.info(args.map(String).join(' '));
          if (ENV !== 'production') {
            const msg = `[${new Date().toISOString()}] [INFO] ${args.map(String).join(' ')}`;
            devLogs.push(msg);
            if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();
          }
        };
        console.error = (...args: any[]) => {
          LoggerSingleton.instance.error(args.map(String).join(' '));
          if (ENV !== 'production') {
            const msg = `[${new Date().toISOString()}] [ERROR] ${args.map(String).join(' ')}`;
            devLogs.push(msg);
            if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();
          }
        };
        console.warn = (...args: any[]) => {
          LoggerSingleton.instance.warn(args.map(String).join(' '));
          if (ENV !== 'production') {
            const msg = `[${new Date().toISOString()}] [WARN] ${args.map(String).join(' ')}`;
            devLogs.push(msg);
            if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();
          }
        };
        console.debug = (...args: any[]) => {
          LoggerSingleton.instance.debug(args.map(String).join(' '));
          if (ENV !== 'production') {
            const msg = `[${new Date().toISOString()}] [DEBUG] ${args.map(String).join(' ')}`;
            devLogs.push(msg);
            if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();
          }
        };
        LoggerSingleton.initialized = true;
      }
    }
    return LoggerSingleton.instance;
  }
}

export default LoggerSingleton;
export function getLastDevLogs(n: number) {
  return devLogs.slice(-n);
}
