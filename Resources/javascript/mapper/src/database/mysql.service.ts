import mysql, { Pool } from 'mysql2/promise';
import { config } from '../config'; 
import { Zone, Person, Sensor, Actuator, LightingSchedule } from '../types/database.types';
import { DatabaseMapper } from './database.mapper';

export class MySQLService {
  private pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      ...config.dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async getZones(): Promise<Zone[]> {
    const [rows] = await this.pool.query('SELECT * FROM zones');
    return DatabaseMapper.mapRows(rows as any[]) as Zone[];
  }

  async getPersons(): Promise<Person[]> {
    const [rows] = await this.pool.query('SELECT * FROM persons WHERE active = true');
    return DatabaseMapper.mapRows(rows as any[]) as Person[];
  }

  async getSensors(): Promise<Sensor[]> {
    const [rows] = await this.pool.query('SELECT * FROM sensors WHERE active = true');
    return DatabaseMapper.mapRows(rows as any[]) as Sensor[];
  }

  async getActuators(): Promise<Actuator[]> {
    const [rows] = await this.pool.query('SELECT * FROM actuators WHERE active = true');
    return DatabaseMapper.mapRows(rows as any[]) as Actuator[];
  }

  async getLightingSchedules(): Promise<LightingSchedule[]> {
    const [rows] = await this.pool.query('SELECT * FROM lighting_schedules');
    return DatabaseMapper.mapRows(rows as any[]) as LightingSchedule[];
  }
}

// Singleton instance of MySQLService
export const mysqlService = new MySQLService();