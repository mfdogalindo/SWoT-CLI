// src/index.ts
import { dataService } from './database/data.service';
import { logger } from './utils/logger.service';

async function initialize() {
  try {
    logger.info('Initializing Mapper application...');

    // Cargar datos iniciales
    await dataService.initialize();

    let persons = await dataService.getPersons();
    let sensors = await dataService.getSensors();
    let zones = await dataService.getZones();
    let actuators = await dataService.getActuators();
    let lightingSchedules = await dataService.getLightingSchedules(); 

    logger.info('Persons: {}', persons);
    logger.info('Sensors: {}', sensors);
    logger.info('Zones: {}', zones);
    logger.info('Actuators: {}', actuators);
    logger.info('Lighting Schedules: {}', lightingSchedules);

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