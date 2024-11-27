import { SensorType, SensorData, Location, ZoneType } from '../types';
import { mqttService } from '../services/mqtt.service';
import { config } from '../config';
import { BehaviorSimulator } from './behavior.simulator';
import { logger } from '../utils/logger.service';

export class SensorSimulator {
  private readonly sensorId: string;
  private readonly type: SensorType;
  private location: Location;
  private static behaviorSimulator: BehaviorSimulator;

  constructor(sensorId: string, type: SensorType, location: Location) {
    this.sensorId = sensorId;
    this.type = type;
    this.location = location;

    if (!SensorSimulator.behaviorSimulator) {
      SensorSimulator.behaviorSimulator = new BehaviorSimulator();
    }
  }

  public simulate(): void {
    // Actualizar ubicación basada en el comportamiento simulado
    if (this.type === SensorType.LOCATION) {
      this.updateLocation();
    }

    const data: SensorData = {
      sensorId: this.sensorId,
      type: this.type,
      timestamp: Date.now(),
      value: this.generateValue(),
      location: this.location
    };

    mqttService.publish(config.topics.sensors, data);
  }

  private updateLocation(): void {
    const entityId = this.sensorId.split('_')[1]; // Obtener ID del residente o personal
    let newZoneId: string;

    if (this.sensorId.startsWith('location_resident')) {
      newZoneId = SensorSimulator.behaviorSimulator.getResidentLocation(entityId);
    } else if (this.sensorId.startsWith('location_')) {
      newZoneId = SensorSimulator.behaviorSimulator.getStaffLocation(entityId);
    } else {
      return;
    }

    // Actualizar la ubicación del sensor
    this.location = {
      zoneId: newZoneId,
      zoneType: this.getZoneType(newZoneId)
    };
  }

  private getZoneType(zoneId: string): ZoneType {
    const zone = config.zones.rooms.find(z => z.id === zoneId);
    return zone ? zone.type : ZoneType.LIVING_ROOM;
  }

  private generateValue(): any {
    switch (this.type) {
      case SensorType.LOCATION:
        return this.location.zoneId;
      case SensorType.MOVEMENT:
        // Probabilidad aumentada de caída durante la noche
        const isNightTime = this.isNightTime();
        const baseProbability = isNightTime ? 0.05 : 0.02;
        return Math.random() < baseProbability ? 'FALL_DETECTED' : 'NORMAL';
      default:
        return null;
    }
  }

  private isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
  }
}