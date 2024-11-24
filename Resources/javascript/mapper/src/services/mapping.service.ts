// src/services/mapping.service.ts

/*


import { Person } from '../models/person';
import { Sensor, SensorReading } from '../models/sensor';
import { Actuator, ActuatorCommand } from '../models/actuator';
import { PersonOntology } from '../ontologies/person';
import { SensorOntology } from '../ontologies/sensor';
import { ActuatorOntology } from '../ontologies/actuator';
import { db, cache } from '../database';
import { jenaService } from './jena.service';
import { mqttService } from './mqtt.service';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class MappingService {
  private static instance: MappingService;
  private actuatorStates: Map<string, Actuator>;
  private readonly CACHE_KEYS = {
    PERSONS: 'persons',
    SENSORS: 'sensors',
    ACTUATORS: 'actuators'
  };

  private constructor() {
    this.actuatorStates = new Map();
    this.initializeSubscriptions();
  }

  public static getInstance(): MappingService {
    if (!MappingService.instance) {
      MappingService.instance = new MappingService();
    }
    return MappingService.instance;
  }

  private initializeSubscriptions(): void {
    // Suscribirse a datos de sensores
    mqttService.subscribe(config.mqtt.topics.sensorData, (message) => {
      this.handleSensorData(message);
    });

    // Suscribirse a comandos de actuadores
    mqttService.subscribe(config.mqtt.topics.actuatorCommands, async (message) => {
      await this.handleActuatorCommand(message);
    });
  }

  // Métodos para manejar personas
  public async getAllPersons(): Promise<Person[]> {
    try {
      if (config.cache.enabled) {
        const cachedPersons = await cache.get<Person[]>(this.CACHE_KEYS.PERSONS);
        if (cachedPersons) {
          return cachedPersons;
        }
      }

      const persons = await db.query<Person[]>('SELECT * FROM persons WHERE active = true');
      
      if (config.cache.enabled) {
        await cache.set(this.CACHE_KEYS.PERSONS, persons, config.cache.ttl);
      }

      // Convertir y almacenar en Jena
      for (const person of persons) {
        const turtle = PersonOntology.toTurtle(person);
        await jenaService.insertData(turtle);
      }

      return persons;
    } catch (error) {
      logger.error('Error fetching persons:', error);
      throw error;
    }
  }

  // Métodos para manejar sensores
  public async getAllSensors(): Promise<Sensor[]> {
    try {
      if (config.cache.enabled) {
        const cachedSensors = await cache.get<Sensor[]>(this.CACHE_KEYS.SENSORS);
        if (cachedSensors) {
          return cachedSensors;
        }
      }

      const sensors = await db.query<Sensor[]>('SELECT * FROM sensors WHERE active = true');
      
      if (config.cache.enabled) {
        await cache.set(this.CACHE_KEYS.SENSORS, sensors, config.cache.ttl);
      }

      // Convertir y almacenar en Jena
      for (const sensor of sensors) {
        const turtle = SensorOntology.toTurtle(sensor);
        await jenaService.insertData(turtle);
      }

      return sensors;
    } catch (error) {
      logger.error('Error fetching sensors:', error);
      throw error;
    }
  }

  private async handleSensorData(message: Buffer): Promise<void> {
    try {
      const reading = JSON.parse(message.toString()) as SensorReading;
      
      // Convertir a RDF y almacenar en Jena
      const turtle = SensorOntology.readingToTurtle(reading);
      await jenaService.insertData(turtle);

      // Si es un sensor de movimiento y detecta caída, generar alerta
      if (reading.sensorId.includes('movement') && reading.value === 'FALL') {
        await this.generateFallAlert(reading);
      }
    } catch (error) {
      logger.error('Error handling sensor data:', error);
    }
  }

  private async generateFallAlert(reading: SensorReading): Promise<void> {
    try {
      const turtle = `
${PREFIXES}
<http://example.org/nursing-home/alert/${reading.sensorId}_${reading.timestamp}> 
    rdf:type nursing:FallAlert ;
    nursing:forSensor <http://example.org/nursing-home/sensor/${reading.sensorId}> ;
    nursing:location <http://example.org/nursing-home/location/${reading.location}> ;
    nursing:timestamp "${new Date(reading.timestamp).toISOString()}"^^xsd:dateTime .
`;
      
      // Publicar alerta en MQTT
      await mqttService.publish(config.mqtt.topics.fallAlerts, turtle);
      
      // Almacenar en Jena
      await jenaService.insertData(turtle);
      
      // Activar alarma en la sala de estar
      const alarmCommand: ActuatorCommand = {
        actuatorId: 'alarm_living-room',
        command: true,
        timestamp: Date.now()
      };
      
      await mqttService.publish(
        config.mqtt.topics.actuatorControl,
        JSON.stringify(alarmCommand)
      );
    } catch (error) {
      logger.error('Error generating fall alert:', error);
    }
  }

  // Métodos para manejar actuadores
  public async refreshActuators(): Promise<void> {
    try {
      const actuators = await db.query<Actuator[]>('SELECT * FROM actuators WHERE active = true');
      
      if (config.cache.enabled) {
        await cache.set(this.CACHE_KEYS.ACTUATORS, actuators, config.cache.ttl);
      }

      // Actualizar estado en memoria y en Jena
      for (const actuator of actuators) {
        this.actuatorStates.set(actuator.id, actuator);
        const turtle = ActuatorOntology.toTurtle(actuator);
        await jenaService.insertData(turtle);
      }
    } catch (error) {
      logger.error('Error refreshing actuators:', error);
    }
  }

  private async handleActuatorCommand(message: Buffer): Promise<void> {
    try {
      const command = JSON.parse(message.toString()) as ActuatorCommand;
      
      // Convertir comando a formato turtle
      const turtle = ActuatorOntology.commandToTurtle(command);
      
      // Almacenar comando en Jena
      await jenaService.insertData(turtle);
      
      // Publicar comando en formato raw para el actuador
      await mqttService.publish(
        config.mqtt.topics.actuatorControl,
        JSON.stringify({
          actuatorId: command.actuatorId,
          command: command.command
        })
      );
      
      // Actualizar estado en memoria
      const actuator = this.actuatorStates.get(command.actuatorId);
      if (actuator) {
        actuator.currentValue = command.command;
        actuator.updatedAt = new Date();
        this.actuatorStates.set(command.actuatorId, actuator);
      }
    } catch (error) {
      logger.error('Error handling actuator command:', error);
    }
  }
}

export const mappingService = MappingService.getInstance();

*/