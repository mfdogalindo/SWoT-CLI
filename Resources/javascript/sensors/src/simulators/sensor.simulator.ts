// src/simulators/sensor.simulator.ts
import { SensorType, SensorData, Location } from '../types';
import { mqttService } from '../services/mqtt.service';
import { config } from '../config';

export class SensorSimulator {
  private readonly sensorId: string;
  private readonly type: SensorType;
  private readonly location: Location;

  constructor(sensorId: string, type: SensorType, location: Location) {
    this.sensorId = sensorId;
    this.type = type;
    this.location = location;
  }

  public simulate(): void {
    const data: SensorData = {
      sensorId: this.sensorId,
      type: this.type,
      timestamp: Date.now(),
      value: this.generateValue(),
      location: this.location,
    };

    mqttService.publish(config.topics.sensors, data);
  }

  private generateValue(): any {
    switch (this.type) {
      case SensorType.LOCATION:
        return this.location.zoneId;
      case SensorType.MOVEMENT:
        // Simula una probabilidad del 2% de caída
        return Math.random() < 0.02 ? 'FALL_DETECTED' : 'NORMAL';
      default:
        return null;
    }
  }
}
