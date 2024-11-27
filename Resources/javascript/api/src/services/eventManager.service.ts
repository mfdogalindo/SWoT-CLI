import { mqttService } from "./mqtt.service";
import { config } from "../config";
import { logger } from "../utils/logger.service";
import { semanticMapper } from "../mappers/sematic.mapper";
import { getWebSocketService, WebSocketService } from "./websocket.service";

export class EventManager {

   private websocketService: WebSocketService | undefined;

   initialize(): void {
      // Subscribe to all topics
      mqttService.subscribe(config.topics.semantic.sensors);
      mqttService.subscribe(config.topics.semantic.actuators);

      this.listen();
      this.websocketService = getWebSocketService();
      logger.info('Event manager initialized');
   }

   listen(): void {
      mqttService.emitter.on('message', (topic, message) => {

         switch (topic) {
            case config.topics.semantic.sensors:
               this.handleSensorMessage(message);
               break;
            case config.topics.semantic.actuators:
               this.handleActuatorStateMessage(message);
               break;
            default:
               logger.warn('Unknown topic: {}', topic);
               break;
         }

      });
   }

   async handleSensorMessage(message: Buffer): Promise<void> {
      const sensorData = await semanticMapper.toSensor(message);

      if (!sensorData) {
         logger.warn('Invalid sensor data: {}', message.toString());
         return;
      }

      this.websocketService?.broadcastSensorUpdate(sensorData);
   }

   async handleActuatorStateMessage(message: Buffer): Promise<void> {
      const actuatorData = await semanticMapper.toActuator(message);

      if (!actuatorData) {
         logger.warn('Invalid actuator data: {}', message.toString());
         return;
      }
      
      this.websocketService?.broadcastActuatorUpdate(actuatorData);
   }

   
}

// Singleton instance of EventManager
export const eventManager = new EventManager();
