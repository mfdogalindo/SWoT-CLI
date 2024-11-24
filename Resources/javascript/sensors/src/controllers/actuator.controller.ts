import { ActuatorSimulator } from '../simulators/actuator.simulator';
import { mqttService } from '../services/mqtt.service';
import { ActuatorCommand, CommandType } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class ActuatorController {
  private actuators: Map<string, ActuatorSimulator>;

  constructor(actuatorsList: ActuatorSimulator[]) {
    this.actuators = new Map();
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
