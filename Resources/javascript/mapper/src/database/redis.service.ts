import Redis from 'ioredis';
import { config } from '../config';
import { Zone, Person, Sensor, Actuator } from '../types/database.types';

export class RedisService {
  private client: Redis;
  private readonly cacheTimeout: number;

  constructor() {
    this.client = new Redis({
      host: config.redisConfig.host,
      port: config.redisConfig.port,
      password: config.redisConfig.password
    });
    this.cacheTimeout = config.redisConfig.cacheTimeout;
  }

  private getKey(type: string): string {
    return `nursing_home:${type}`;
  }

  async setCachedData<T>(type: string, data: T[]): Promise<void> {
    const key = this.getKey(type);
    await this.client.setex(key, this.cacheTimeout, JSON.stringify(data));
  }

  async getCachedData<T>(type: string): Promise<T[] | null> {
    const key = this.getKey(type);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
}


// Singleton instance of RedisService
export const redisService = new RedisService();