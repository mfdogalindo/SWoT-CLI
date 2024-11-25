import { MySQLService } from './mysql.service';
import { RedisService } from './redis.service';
import { Zone, Person, Sensor, Actuator, LightingSchedule } from '../types/database.types';
import { logger } from '../utils/logger.service';
import { config } from '../config';

export class DataService {
  private mysqlService: MySQLService;
  private redisService: RedisService;
  private actuatorUpdateInterval: NodeJS.Timeout | undefined;

  constructor() {
    this.mysqlService = new MySQLService();
    this.redisService = new RedisService();
    this.startActuatorUpdateInterval();
  }

  private startActuatorUpdateInterval(): void {
    this.actuatorUpdateInterval = setInterval(
      () => this.updateCache(),
      1000 * config.redisConfig.cacheTimeout
    );
  }

  async updateCache(): Promise<void> {
    try {
      await Promise.all([
        this.getZones(),
        this.getPersons(),
        this.getSensors(),
        this.getActuators(),
        this.getLightingSchedules()
      ]);
      logger.info('DB cache updated');
    } catch (error) {
      logger.error('Error updating cache:', error);
    }
  }

  private async getDataWithCache<T>(
    type: string,
    fetchFunction: () => Promise<T[]>
  ): Promise<T[]> {
    try {
      const cachedData = await this.redisService.getCachedData<T>(type);
      if (cachedData) {
        return cachedData;
      }

      const data = await fetchFunction();
      await this.redisService.setCachedData(type, data);
      return data;
    } catch (error) {
      logger.error(`Error fetching ${type}:`, error);
      throw error;
    }
  }

  async getZones(): Promise<Zone[]> {
    return this.getDataWithCache('zones', () => this.mysqlService.getZones());
  }

  async getPersons(): Promise<Person[]> {
    return this.getDataWithCache('persons', () => this.mysqlService.getPersons());
  }

  async getSensors(): Promise<Sensor[]> {
    return this.getDataWithCache('sensors', () => this.mysqlService.getSensors());
  }

  getActuators(): Promise<Actuator[]> {
    return this.getDataWithCache('actuators', () => this.mysqlService.getActuators());
  }

  async getLightingSchedules(): Promise<LightingSchedule[]> {
    return this.getDataWithCache('lighting_schedules',
      () => this.mysqlService.getLightingSchedules()
    );
  }

  async initialize(): Promise<void> {
    return this.updateCache();
  }

  cleanup(): void {
    clearInterval(this.actuatorUpdateInterval);
  }
}

// Singleton instance of DataService
export const dataService = new DataService();