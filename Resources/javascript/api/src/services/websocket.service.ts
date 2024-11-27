// src/services/websocket.service.ts
import WebSocket from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger.service';
import { Sensor, Actuator } from '../models';

export class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.init();
  }

  private init(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.info('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  public broadcast(eventType: string, data: any): void {
    const message = JSON.stringify({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastSensorUpdate(sensor: Sensor): void {
    this.broadcast('sensor_update', sensor);
  }

  public broadcastActuatorUpdate(actuator: Actuator): void {
    this.broadcast('actuator_update', actuator);
  }
}

// Singleton instance
let websocketService: WebSocketService;

export const initWebSocketService = (server: Server): WebSocketService => {
  if (!websocketService) {
    websocketService = new WebSocketService(server);
  }
  return websocketService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return websocketService;
};