// src/index.ts
import { config } from './config';
import { SensorSimulator } from './simulators/sensor.simulator';
import { ActuatorSimulator } from './simulators/actuator.simulator';
import { SensorType, ActuatorType, ZoneType } from './types';
import { ActuatorController } from './controllers/actuator.controller';
import { logger } from './utils/logger.service';
import { ScheduleService } from './services/schedule.service';
import { BehaviorSimulator } from './services/behavior.simulator';

class SimulationRunner {
  private behaviorSimulator: BehaviorSimulator;
  private scheduleService: ScheduleService;
  private simulationStartTime: number;

  private actuators: ActuatorSimulator[] = [];

  constructor() {
    // Inicializar servicios core
    this.scheduleService = ScheduleService.getInstance();
    this.behaviorSimulator = new BehaviorSimulator();
    this.simulationStartTime = Date.now();
    new ActuatorController();
  }

}


// Iniciar la simulación
if (require.main === module) {
  try {
    new SimulationRunner();
    logger.info('Simulation runner initialized successfully');
  } catch (error) {
    logger.error('Error starting simulation:', error);
    process.exit(1);
  }
}

// Manejo de señales para una terminación limpia
process.on('SIGINT', () => {
  logger.info('Shutting down simulation...');
  process.exit(0);
});
