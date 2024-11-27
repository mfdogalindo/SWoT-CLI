import { ActuatorSimulator } from '../simulators/actuator.simulator';
import { mqttService } from '../services/mqtt.service';
import { ActuatorCommand, ActuatorType, CommandType, ZoneType } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class ActuatorController {
  private actuators: Map<string, ActuatorSimulator>;

  constructor() {
    this.actuators = new Map();
    let actuatorsList: ActuatorSimulator[] = [];

    // Crear actuadores para cada zona
    config.zones.rooms.forEach(zone => {
      // Actuador de temperatura para cada zona
      actuatorsList.push(
        new ActuatorSimulator(`temp_${zone.id}`, ActuatorType.TEMPERATURE, {
          zoneId: zone.id,
          zoneType: zone.type,
        }),
      );

      // Actuador de luz para cada zona
      actuatorsList.push(
        new ActuatorSimulator(`light_${zone.id}`, ActuatorType.LIGHT, {
          zoneId: zone.id,
          zoneType: zone.type,
        }),
      );
    });

    // Crear actuador de alarma en el salón de estar
    actuatorsList.push(
      new ActuatorSimulator('alarm_living-room', ActuatorType.ALARM, {
        zoneId: 'living-room',
        zoneType: ZoneType.LIVING_ROOM,
      }),
    );

    actuatorsList.forEach(actuator => {
      const state = actuator.getState();
      this.actuators.set(state.actuatorId, actuator);
    });

    this.messageListener();
  }

  private messageListener(): void {
    mqttService.emitter.on('message', (topic, message) => {
      if (topic === config.topics.actuators.command) {
        try {
          const command = JSON.parse(message.toString()) as ActuatorCommand;
          command.type = CommandType.UPDATE_VALUE;
          this.handleCommand(command);
        } catch (error) {
          logger.error('Error parsing actuator command:' + error);
          logger.debug('Error parsing actuator input: {}', message.toString());
        }
      }

      if (topic === config.topics.actuators.stateRequest) {
        const command: ActuatorCommand = {
          type: CommandType.REQUEST_STATE,
        };
        this.handleCommand(command);
      }
    });
  }

  private handleCommand(command: ActuatorCommand): void {
    logger.debug('Command received:', command);

    switch (command.type) {
      case CommandType.UPDATE_VALUE:
        if (command.actuatorId && command.command !== undefined) {
          const actuator = this.actuators.get(command.actuatorId);
          if (actuator) {
            actuator.updateValue(command.command);
            logger.debug(`Actuator ${command.actuatorId} updated to: ${command.command}`);
          } else {
            logger.error(`Actuator not found: ${command.actuatorId}`);
          }
        }
        break;
      case CommandType.REQUEST_STATE:
        if (command.actuatorId) {
          this.publishActuatorState(command.actuatorId);
        } else {
          this.publishAllStates();
        }
        break;
      default:
        console.error(`Unknown command type: ${command.type}`);
    }
  }

  private publishActuatorState(actuatorId: string): void {
    const actuator = this.actuators.get(actuatorId);
    if (actuator) {
      const state = actuator.getState();
      mqttService.publish(config.topics.actuators.state, state);
    }
  }

  private publishAllStates(): void {
    this.actuators.forEach(actuator => {
      const state = actuator.getState();
      mqttService.publish(config.topics.actuators.state, state);
    });
  }
}
