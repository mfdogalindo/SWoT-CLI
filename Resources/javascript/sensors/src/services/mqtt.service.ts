// src/services/mqtt.service.ts
import mqtt from 'mqtt';
import { config } from '../config';
import EventEmitter from 'events';
import { logger } from './logger.service';

class MQTTService {
  private client: mqtt.MqttClient;
  public emitter = new EventEmitter();

  constructor() {
    this.client =
      config.mqtt.username && config.mqtt.password
        ? mqtt.connect(`mqtt://${config.mqtt.host}:${config.mqtt.port}`, {
            username: config.mqtt.username,
            password: config.mqtt.password,
          })
        : mqtt.connect(`mqtt://${config.mqtt.host}:${config.mqtt.port}`);

    this.init();
  }

  private init(): void {
    this.client.on('connect', () => {
      logger.info('Connected to MQTT broker');
      // Suscribirse al topic de comandos
      this.client.subscribe(config.topics.actuators.command, err => {
        if (!err) {
          logger.info(
            'Subscribed to actuator commands: ' +
              config.topics.actuators.command,
          );
        }
      });

      // Suscribirse al topic de solicitud de estado
      this.client.subscribe(config.topics.actuators.stateRequest, err => {
        if (!err) {
          logger.info(
            'Subscribed to state request topic:' +
              config.topics.actuators.stateRequest,
          );
        }
      });
    });

    this.client.on('message', (topic, message) => {
      this.emitter.emit('message', topic, message);
    });

    this.client.on('error', error => {
      logger.error('MQTT Error:', error);
    });
  }

  public publish(topic: string, message: any): void {
    this.client.publish(topic, JSON.stringify(message));
  }

  public close(): void {
    this.client.end();
  }
}

export const mqttService = new MQTTService();
