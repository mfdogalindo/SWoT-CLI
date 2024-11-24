import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private subscriber: Redis | null = null;

  // Prefijos para las claves
  private readonly KEY_PREFIXES = {
    PERSON: 'person:',
    SENSOR: 'sensor:',
    ACTUATOR: 'actuator:',
    ZONE: 'zone:',
    COLLECTION: 'collection:',
    HASH: 'hash:'
  };

  private constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      connectTimeout: 10000,
      commandTimeout: 5000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('ready', () => {
      logger.info('Redis is ready to accept commands');
    });

    this.client.on('reconnecting', () => {
      logger.warn('Reconnecting to Redis...');
    });

    this.client.on('end', () => {
      logger.warn('Redis connection ended');
    });
  }

  // Obtener instancia de suscriptor para pub/sub
  private async getSubscriber(): Promise<Redis> {
    if (!this.subscriber) {
      this.subscriber = this.client.duplicate();
    }
    return this.subscriber;
  }

  // Método para suscribirse a eventos
  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = await this.getSubscriber();
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  // Método para publicar eventos
  public async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  [... resto de métodos del CacheService ...]
}