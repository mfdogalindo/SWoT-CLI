import mysql, { Pool } from 'mysql2/promise';
import { config } from '../config'; 
import { Zone, Person, Sensor, Actuator } from '../types/database.types';

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
    return rows as Zone[];
  }

  async getPersons(): Promise<Person[]> {
    const [rows] = await this.pool.query('SELECT * FROM persons WHERE active = true');
    return rows as Person[];
  }

  async getSensors(): Promise<Sensor[]> {
    const [rows] = await this.pool.query('SELECT * FROM sensors WHERE active = true');
    return rows as Sensor[];
  }

  async getActuators(): Promise<Actuator[]> {
    const [rows] = await this.pool.query('SELECT * FROM actuators WHERE active = true');
    return rows as Actuator[];
  }
}

// Singleton instance of MySQLService
export const mysqlService = new MySQLService();