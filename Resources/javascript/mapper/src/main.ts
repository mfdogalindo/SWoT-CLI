// src/index.ts
import { mappingService } from './services/mapping.service';
import { schedulerService } from './services/scheduler.service';
import { logger } from './utils/logger';

async function initialize() {
  try {
    logger.info('Initializing Mapper application...');

    // Cargar datos iniciales
    await Promise.all([
      mappingService.getAllPersons(),
      mappingService.getAllSensors(),
      mappingService.refreshActuators()
    ]);

    // Iniciar tareas programadas
    schedulerService.startJobs();

    logger.info('Mapper application initialized successfully');
  } catch (error) {
    logger.error('Error initializing application:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  schedulerService.stopJobs();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  schedulerService.stopJobs();
  process.exit(0);
});

// Iniciar aplicación
initialize();