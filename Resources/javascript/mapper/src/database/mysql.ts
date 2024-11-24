import mysql from 'mysql2/promise';
import { DatabaseConfig, QueryResult, ConnectionPool } from './types';
import { config } from '../config';
import { logger } from '../utils/logger';

export class MySQLClient {
  private static instance: MySQLClient;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00',
      dateStrings: true
    });

    // Añadir handler para errores de conexión
    this.pool.on('error', (err) => {
      logger.error('MySQL pool error:', err);
    });
  }

  public static getInstance(): MySQLClient {
    if (!MySQLClient.instance) {
      MySQLClient.instance = new MySQLClient();
    }
    return MySQLClient.instance;
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('MySQL connection test failed:', error);
      return false;
    }
  }

  public async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      return {
        rows: rows as T[],
        rowCount: Array.isArray(rows) ? rows.length : 0
      };
    } catch (error) {
      logger.error('MySQL query error:', error);
      throw error;
    }
  }

  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async getPoolStats(): Promise<ConnectionPool> {
    const pool = this.pool.pool as any;
    return {
      totalCount: pool._allConnections.length,
      idleCount: pool._freeConnections.length,
      waitingCount: pool._connectionQueue.length
    };
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}