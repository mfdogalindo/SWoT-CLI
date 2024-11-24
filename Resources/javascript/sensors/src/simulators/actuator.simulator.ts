import { ActuatorType, Location, ActuatorState } from '../types';
import { mqttService } from '../services/mqtt.service';
import { config } from '../config';
import { logger } from '../services/logger.service';

export class ActuatorSimulator {
  private readonly actuatorId: string;
  private readonly type: ActuatorType;
  private readonly location: Location;
  private currentValue: any;

  constructor(actuatorId: string, type: ActuatorType, location: Location) {
    this.actuatorId = actuatorId;
    this.type = type;
    this.location = location;
    this.currentValue = this.getInitialValue();
    this.publishState();
  }

  private getInitialValue(): any {
    switch (this.type) {
      case ActuatorType.TEMPERATURE:
        return 22;
      case ActuatorType.LIGHT:
        return false;
      case ActuatorType.ALARM:
        return false;
      default:
        return null;
    }
  }

  public updateValue(value: any): void {
    // Validar valores según el tipo de actuador
    if (this.isValidValue(value)) {
      this.currentValue = value;
      this.publishState();
    } else {
      logger.error(`Invalid value for actuator ${this.actuatorId}: ${value}`);
    }
  }

  private isValidValue(value: any): boolean {
    switch (this.type) {
      case ActuatorType.TEMPERATURE:
        return typeof value === 'number' && value >= 15 && value <= 30;
      case ActuatorType.LIGHT:
      case ActuatorType.ALARM:
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  public getState(): ActuatorState {
    return {
      actuatorId: this.actuatorId,
      type: this.type,
      value: this.currentValue,
      timestamp: Date.now(),
      location: this.location,
    };
  }

  private publishState(): void {
    const state = this.getState();
    mqttService.publish(config.topics.actuators.state, state);
  }
}
