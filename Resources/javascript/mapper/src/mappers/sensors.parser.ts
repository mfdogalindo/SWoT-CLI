import { SensorData, ActuatorData, ActuatorCommand } from '../types/devices.types';
import { logger } from '../utils/logger.service';

export class SensorsParser {
  static parseSensorData(message: Buffer): SensorData | null {
    try {
      const data = JSON.parse(message.toString());
      
      // Validación básica de la estructura
      if (!data.sensorId || !data.type || !data.timestamp || !data.location) {
        throw new Error('Invalid sensor data structure');
      }

      return {
        sensorId: data.sensorId,
        type: data.type,
        timestamp: data.timestamp,
        value: data.value,
        location: {
          zoneId: data.location.zoneId,
          zoneType: data.location.zoneType
        }
      };
    } catch (error) {
      logger.error('Error parsing sensor data:', error);
      return null;
    }
  }

  static parseActuatorData(message: Buffer): ActuatorData | null {
    try {
      const data = JSON.parse(message.toString());
      
      // Validación básica de la estructura
      if (!data.actuatorId || !data.type || !data.timestamp || !data.location) {
        throw new Error('Invalid actuator data structure');
      }

      return {
        actuatorId: data.actuatorId,
        type: data.type,
        value: data.value,
        timestamp: data.timestamp,
        location: {
          zoneId: data.location.zoneId,
          zoneType: data.location.zoneType
        }
      };
    } catch (error) {
      logger.error('Error parsing actuator data:', error);
      return null;
    }
  }

  static parseActuatorCommand(message: Buffer): ActuatorCommand | null {
    try {
      const data = JSON.parse(message.toString());
      
      // Validación básica de la estructura
      if (!data.actuatorId || data.command === undefined) {
        throw new Error('Invalid actuator command structure');
      }

      return {
        actuatorId: data.actuatorId,
        command: data.command
      };
    } catch (error) {
      logger.error('Error parsing actuator command:', error);
      return null;
    }
  }
}
