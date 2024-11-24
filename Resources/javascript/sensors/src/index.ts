// src/index.ts
import { config } from './config';
import { SensorSimulator } from './simulators/sensor.simulator';
import { ActuatorSimulator } from './simulators/actuator.simulator';
import { SensorType, ActuatorType, ZoneType } from './types';
import { ActuatorController } from './controllers/actuator.controller';
import { logger } from './services/logger.service';

// Crear sensores y actuadores para cada zona
const sensors: SensorSimulator[] = [];
const actuators: ActuatorSimulator[] = [];

// Crear sensores de ubicación y movimiento para residentes
const residents = [
  'resident1',
  'resident2',
  'resident3',
  'resident4',
  'resident5',
];
residents.forEach(residentId => {
  // Sensor de ubicación
  sensors.push(
    new SensorSimulator(
      `location_${residentId}`,
      SensorType.LOCATION,
      { zoneId: 'room1', zoneType: ZoneType.ROOM }, // ubicación inicial
    ),
  );

  // Sensor de movimiento
  sensors.push(
    new SensorSimulator(`movement_${residentId}`, SensorType.MOVEMENT, {
      zoneId: 'room1',
      zoneType: ZoneType.ROOM,
    }),
  );
});

// Crear sensores de ubicación para el personal
const staff = ['nurse1', 'nurse2', 'staff1'];
staff.forEach(staffId => {
  sensors.push(
    new SensorSimulator(
      `location_${staffId}`,
      SensorType.LOCATION,
      { zoneId: 'living-room', zoneType: ZoneType.LIVING_ROOM }, // ubicación inicial
    ),
  );
});

// Crear actuadores para cada zona
config.zones.rooms.forEach(zone => {
  // Actuador de temperatura para cada zona
  actuators.push(
    new ActuatorSimulator(`temp_${zone.id}`, ActuatorType.TEMPERATURE, {
      zoneId: zone.id,
      zoneType: zone.type,
    }),
  );

  // Actuador de luz para cada zona
  actuators.push(
    new ActuatorSimulator(`light_${zone.id}`, ActuatorType.LIGHT, {
      zoneId: zone.id,
      zoneType: zone.type,
    }),
  );
});

// Crear actuador de alarma en el salón de estar
actuators.push(
  new ActuatorSimulator('alarm_living-room', ActuatorType.ALARM, {
    zoneId: 'living-room',
    zoneType: ZoneType.LIVING_ROOM,
  }),
);

// Inicializar el controlador de actuadores
new ActuatorController(actuators);

// Iniciar simulación
setInterval(() => {
  sensors.forEach(sensor => sensor.simulate());
}, config.simulation.updateInterval);

// Manejo de señales para una terminación limpia
process.on('SIGINT', () => {
  logger.info('Cerrando conexión MQTT...');
  process.exit(0);
});
