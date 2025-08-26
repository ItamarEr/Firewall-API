import winston from 'winston';
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
    level = 'debug';
  }
} catch (err) {
  // Fallback to console if file transport fails
  transports = [new winston.transports.Console({ format: logFormat })];
  level = 'debug';
  console.error('Logger initialization failed, falling back to console:', err);
}

const logger = winston.createLogger({
  level,
  transports,
  exitOnError: false,
});

// Overwrite console.log to use logger
console.log = (...args: any[]) => {
  logger.info(args.map(String).join(' '));
};

export default logger;
