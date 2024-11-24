// src/services/cache.service.ts
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger.service';
import { Person, Sensor, Actuator } from '../models';
/*
export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  
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
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
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
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Métodos para Personas
  public async setPerson(person: Person): Promise<void> {
    const key = `${this.KEY_PREFIXES.PERSON}${person.id}`;
    await this.client.hset(key, {
      ...person,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString()
    });
    await this.client.expire(key, config.cache.ttl);
  }

  public async getPerson(id: string): Promise<Person | null> {
    const key = `${this.KEY_PREFIXES.PERSON}${id}`;
    const data = await this.client.hgetall(key);
    
    if (Object.keys(data).length === 0) {
      return null;
    }

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    } as Person;
  }

  public async setPersons(persons: Person[]): Promise<void> {
    const pipeline = this.client.pipeline();
    const collectionKey = `${this.KEY_PREFIXES.COLLECTION}persons`;
    
    // Guardar cada persona individualmente
    for (const person of persons) {
      const key = `${this.KEY_PREFIXES.PERSON}${person.id}`;
      pipeline.hset(key, {
        ...person,
        createdAt: person.createdAt.toISOString(),
        updatedAt: person.updatedAt.toISOString()
      });
      pipeline.expire(key, config.cache.ttl);
    }

    // Guardar lista de IDs
    pipeline.del(collectionKey);
    if (persons.length > 0) {
      pipeline.sadd(collectionKey, ...persons.map(p => p.id));
      pipeline.expire(collectionKey, config.cache.ttl);
    }

    await pipeline.exec();
  }

  public async getPersons(): Promise<Person[]> {
    const collectionKey = `${this.KEY_PREFIXES.COLLECTION}persons`;
    const ids = await this.client.smembers(collectionKey);
    
    if (ids.length === 0) {
      return [];
    }

    const pipeline = this.client.pipeline();
    ids.forEach(id => {
      pipeline.hgetall(`${this.KEY_PREFIXES.PERSON}${id}`);
    });

    const results = await pipeline.exec();
    return results!
      .map(([err, data]) => {
        if (err || !data) return null;
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        } as Person;
      })
      .filter((person): person is Person => person !== null);
  }

  // Métodos para Sensores
  public async setSensorState(sensorId: string, state: any): Promise<void> {
    const key = `${this.KEY_PREFIXES.SENSOR}${sensorId}:state`;
    await this.client.set(key, JSON.stringify(state), 'EX', config.cache.ttl);
  }

  public async getSensorState(sensorId: string): Promise<any | null> {
    const key = `${this.KEY_PREFIXES.SENSOR}${sensorId}:state`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Métodos para Actuadores
  public async setActuatorState(actuatorId: string, state: any): Promise<void> {
    const key = `${this.KEY_PREFIXES.ACTUATOR}${actuatorId}:state`;
    await this.client.set(key, JSON.stringify(state), 'EX', config.cache.ttl);
  }

  public async getActuatorState(actuatorId: string): Promise<any | null> {
    const key = `${this.KEY_PREFIXES.ACTUATOR}${actuatorId}:state`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Métodos para limpiar caché
  public async clearPersonCache(): Promise<void> {
    const keys = await this.client.keys(`${this.KEY_PREFIXES.PERSON}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  public async clearSensorCache(): Promise<void> {
    const keys = await this.client.keys(`${this.KEY_PREFIXES.SENSOR}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  public async clearActuatorCache(): Promise<void> {
    const keys = await this.client.keys(`${this.KEY_PREFIXES.ACTUATOR}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Método para limpiar todo el caché
  public async clearAll(): Promise<void> {
    await this.client.flushdb();
  }

  // Métodos de utilidad
  public async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      logger.error('Redis ping error:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.client.quit();
  }
}

export const cacheService = CacheService.getInstance();

*/