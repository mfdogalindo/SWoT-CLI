import { MySQLClient } from './mysql';
import { CacheService } from './cache';

export const db = MySQLClient.getInstance();
export const cache = CacheService.getInstance();

// Función de inicialización de base de datos
export async function initializeDatabase(): Promise<void> {
  try {
    // Verificar conexión MySQL
    await db.testConnection();
    
    // Verificar conexión Redis
    await cache.ping();
  } catch (error) {
    throw new Error(`Error initializing database connections: ${error}`);
  }
}