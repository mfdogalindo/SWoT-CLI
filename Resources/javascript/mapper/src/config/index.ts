import dotenv from 'dotenv';
import { stat } from 'fs';

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
      semantic: {
         sensors: process.env.SEMANTIC_SENSORS_TOPIC || 'nursing-home/semantic/sensors',
         actuators: {
            state:
               process.env.SEMANTIC_ACTUATOR_STATE_TOPIC ||
               'nursing-home/semantic/actuators/state',
            command:
               process.env.SEMANTIC_ACTUATOR_CMD_TOPIC ||
               'nursing-home/semantic/actuators/command',
            stateRequest:
               process.env.SEMANTIC_ACTUATOR_STATE_REQUEST_TOPIC ||
               'nursing-home/semantic/actuators/state/request',
         }
      }
   },
   jena:{
      username: process.env.JENA_USER || 'admin',
      password: process.env.JENA_PASS || '',
      host: process.env.JENA_HOST || 'http://localhost:3030',
      dataset: process.env.JENA_DATASET || 'nursing-home',
   },
   logging: {
      level: process.env.LOG_LEVEL || 'info',
   },
}