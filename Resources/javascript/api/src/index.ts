// src/index.ts

import { eventManager } from './services/eventManager.service';
import { jenaService } from './services/jena.service';
import { logger } from './utils/logger.service';
import express from 'express';
import http from 'http';
import { initWebSocketService } from './services/websocket.service';

const app = express();

async function initialize() {
  try {
    logger.info('Initializing API application...');

    const server = http.createServer(app);

    // Inicializar WebSocket service
    initWebSocketService(server);

    // Cargar datos iniciales
    await jenaService.initialize();

    // Iniciar servicios
    eventManager.initialize();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    logger.info('API application initialized successfully');
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