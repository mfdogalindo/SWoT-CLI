import dotenv from 'dotenv';
import { ZoneType } from '../types';

dotenv.config();

export const config = {
  mqtt: {
    host: process.env.MQTT_HOST || 'localhost',
    port: parseInt(process.env.MQTT_PORT || '1883'),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },
  topics: {
    sensors: process.env.SENSORS_TOPIC || 'nursing-home/sensors',
    actuators: {
      state: process.env.ACTUATOR_STATE_TOPIC || 'nursing-home/actuators/state',
      stateRequest:
        process.env.ACTUATOR_STATE_REQUEST_TOPIC ||
        'nursing-home/actuators/state/request',
      command:
        process.env.ACTUATOR_CMD_TOPIC || 'nursing-home/actuators/command',
    },
  },
  simulation: {
    updateInterval: parseInt(process.env.UPDATE_INTERVAL || '5000'),
    residents: {
      defaultRooms: {
        'resident1': 'room1',
        'resident2': 'room2',
        'resident3': 'room3',
        'resident4': 'room4',
        'resident5': 'room5'
      },
      mealTimes: {
        breakfast: { start: 8, duration: 1 },
        lunch: { start: 13, duration: 1 },
        dinner: { start: 19, duration: 1 }
      },
      activities: {
        morning: { start: 10, duration: 2, location: 'living_room' },
        afternoon: { start: 15, duration: 2, location: 'yard' },
        evening: { start: 17, duration: 2, location: 'living_room' }
      }
    },
    staff: {
      shiftChanges: {
        morning: 7,
        afternoon: 15,
        night: 23
      }
    }
  },
  zones: {
    rooms: [
      { id: 'room1', type: ZoneType.ROOM },
      { id: 'room2', type: ZoneType.ROOM },
      { id: 'room3', type: ZoneType.ROOM },
      { id: 'room4', type: ZoneType.ROOM },
      { id: 'room5', type: ZoneType.ROOM },
      { id: 'bathroom1', type: ZoneType.BATHROOM },
      { id: 'bathroom2', type: ZoneType.BATHROOM },
      { id: 'bathroom3', type: ZoneType.BATHROOM },
      { id: 'bathroom4', type: ZoneType.BATHROOM },
      { id: 'bathroom5', type: ZoneType.BATHROOM },
      { id: 'living_room', type: ZoneType.LIVING_ROOM },
      { id: 'dining_room', type: ZoneType.DINING_ROOM },
      { id: 'yard', type: ZoneType.YARD },
    ],
  },
  logging: {
    level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
  },
};
