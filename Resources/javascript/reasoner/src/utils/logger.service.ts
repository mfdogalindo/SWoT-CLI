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

  private formatMessage(template: string, ...args: any[]): string {
    if (args.length === 0) return template;

    let formattedMessage = template;
    for (let i = 0; i < args.length; i++) {
      const value = args[i];
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      formattedMessage = formattedMessage.replace('{}', stringValue);
    }
    return formattedMessage;
  }

  error(message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.error(this.formatMessage(message, ...messageArgs), meta);
  }

  warn(message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.warn(this.formatMessage(message, ...messageArgs), meta);
  }

  info(message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.info(this.formatMessage(message, ...messageArgs), meta);
  }

  http(message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.http(this.formatMessage(message, ...messageArgs), meta);
  }

  debug(message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.debug(this.formatMessage(message, ...messageArgs), meta);
  }

  log(level: LogLevel, message: string, ...args: any[]): void {
    const meta = this.extractMeta(args);
    const messageArgs = meta ? args.slice(0, -1) : args;
    this.logger.log(level, this.formatMessage(message, ...messageArgs), meta);
  }

  private extractMeta(args: any[]): LogMeta | undefined {
    if (args.length === 0) return undefined;
    const lastArg = args[args.length - 1];
    if (typeof lastArg === 'object' && !Array.isArray(lastArg) && lastArg !== null) {
      return lastArg as LogMeta;
    }
    return undefined;
  }
}

export const logger = new Logger(winstonLogger);