import { MySQLService } from './mysql.service';
import { RedisService } from './redis.service';
import { Zone, Person, Sensor, Actuator } from '../types/database.types';
import { logger } from '../utils/logger.service';

export class DataService {
  private mysqlService: MySQLService;
  private redisService: RedisService;
  private actuatorsCache: Actuator[] = [];
  private actuatorUpdateInterval: NodeJS.Timeout | undefined;

  constructor() {
    this.mysqlService = new MySQLService();
    this.redisService = new RedisService();
    this.startActuatorUpdateInterval();
  }

  private startActuatorUpdateInterval(): void {
    this.actuatorUpdateInterval = setInterval(
      () => this.updateActuatorsCache(),
      10 * 60 * 1000 // 10 minutes
    );
  }

  async updateActuatorsCache(): Promise<void> {
    try {
      this.actuatorsCache = await this.mysqlService.getActuators();
      logger.info('Actuators cache updated');
    } catch (error) {
      logger.error('Error updating actuators cache:', error);
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

  getActuators(): Actuator[] {
    return this.actuatorsCache;
  }

  async initialize(): Promise<void> {
    await this.updateActuatorsCache();
    await Promise.all([
      this.getZones(),
      this.getPersons(),
      this.getSensors()
    ]);
  }

  cleanup(): void {
    clearInterval(this.actuatorUpdateInterval);
  }
}

// Singleton instance of DataService
export const dataService = new DataService();