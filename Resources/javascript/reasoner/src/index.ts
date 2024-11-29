import { mqttService } from './services/mqtt.service';
import { jenaService } from './services/jena.service';
import { TemperatureService } from './services/temperature.service';
import { FallDetectionService } from './services/falldetection.service';
import { config } from './config';
import { logger } from './utils/logger.service';

const temperatureService = new TemperatureService();
const fallDetectionService = new FallDetectionService();

async function initialize() {
  try {
    logger.info('Initializing Reasoner application...');

    // Initialize Jena service
    await jenaService.initialize();

    // Initialize Falli detection service
    await fallDetectionService.start();

    // Start temperature service
    await temperatureService.start();

    logger.info('Reasoner application initialized successfully');
  } catch (error) {
    logger.error('Error initializing application:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await temperatureService.stop();
  fallDetectionService.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await temperatureService.stop();
  fallDetectionService.cleanup();
  process.exit(0);
});

initialize();