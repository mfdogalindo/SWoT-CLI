import { mqttService } from "./mqtt.service";
import { config } from "../config";
import { logger } from "../utils/logger.service";
import { SensorsParser } from "../mappers/sensors.parser";
import { semanticMapping } from "./semanticMapping.service";

export class EventManager {

   initialize(): void {
      // Subscribe to all topics
      mqttService.subscribe(config.topics.sensors);
      mqttService.subscribe(config.topics.actuators.state);
      mqttService.subscribe(config.topics.actuators.command);

      this.listen();
      logger.info('Event manager initialized');
   }

   listen(): void {
      mqttService.emitter.on('message', (topic, message) => {

         switch (topic) {
            case config.topics.sensors:
               this.handleSensorMessage(message);
               break;
            case config.topics.actuators.state:
               this.handleActuatorStateMessage(message);
               break;
            case config.topics.actuators.command:
               this.handleActuatorCommandMessage(message);
               break;
            default:
               logger.warn('Unknown topic: {}', topic);
               break;
         }

      });
   }

   async handleSensorMessage(message: Buffer): Promise<void> {
      // logger.debug('Sensor message received: {}', message.toString());
      const sensorData = SensorsParser.parseSensorData(message);

      if (!sensorData) {
         logger.warn('Invalid sensor data: {}', message.toString());
         return;
      }

      const mappedSensorData = await semanticMapping.mapSensorData(sensorData);
      mqttService.publish(config.topics.semantic.sensors, mappedSensorData);
   }

   async handleActuatorStateMessage(message: Buffer): Promise<void> {
      const actuatorData = await SensorsParser.parseActuatorData(message);

      if (!actuatorData) {
         logger.warn('Invalid actuator data: {}', message.toString());
         return;
      }
      
      const mappedActuatorData = semanticMapping.mapActuatorData(actuatorData);
      mqttService.publish(config.topics.semantic.actuators.state, mappedActuatorData);
   }

   async handleActuatorCommandMessage(message: Buffer): Promise<void> {
      const actuatorCommand = await SensorsParser.parseActuatorCommand(message);

      if (!actuatorCommand) {
         logger.warn('Invalid actuator command: {}', message.toString());
         return;
      }

      // logger.debug('Actuator command message received: {}', message.toString());
   }

   
}

// Singleton instance of EventManager
export const eventManager = new EventManager();
