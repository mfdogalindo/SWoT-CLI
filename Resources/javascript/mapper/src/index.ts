// src/index.ts
import { dataService } from './database/data.service';
import { eventManager } from './services/eventManager.service';
import { logger } from './utils/logger.service';

async function initialize() {
  try {
    logger.info('Initializing Mapper application...');

    // Cargar datos iniciales
    await dataService.initialize();

    // Iniciar servicios
    eventManager.initialize();

    logger.info('Mapper application initialized successfully');
  } catch (error) {
    logger.error('Error initializing application:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  //schedulerService.stopJobs();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  //schedulerService.stopJobs();
  process.exit(0);
});

// Iniciar aplicación
initialize();