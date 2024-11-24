import winston from 'winston';
import { LogLevel, LogMeta } from '../types/logger.types';
import { config } from '../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';
    return `${timestamp} ${level}: ${message}${metaString}`;
  }),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

const winstonLogger = winston.createLogger({
  level: config.logging.level,
  levels,
  format,
  transports,
});

class Logger {
  private logger: winston.Logger;

  constructor(winstonInstance: winston.Logger) {
    this.logger = winstonInstance;
  }

  error(message: string, meta?: LogMeta): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.logger.info(message, meta);
  }

  http(message: string, meta?: LogMeta): void {
    this.logger.http(message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(message, meta);
  }

  log(level: LogLevel, message: string, meta?: LogMeta): void {
    this.logger.log(level, message, meta);
  }
}

export const logger = new Logger(winstonLogger);
