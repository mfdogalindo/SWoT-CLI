import dotenv from 'dotenv';

dotenv.config();

export const config = {
   mqtt: {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883'),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
   },
   topics: {
      actuators: {
         stateRequest:
            process.env.ACTUATOR_STATE_REQUEST_TOPIC ||
            'nursing-home/actuators/state/request',
      },
      semantic: {
         sensors: process.env.SEMANTIC_SENSOR_TOPIC || 'nursing-home/semantic/sensors',
         actuators: process.env.SEMANTIC_ACTUATOR_TOPIC || 'nursing-home/semantic/actuators',
      }
   },
   jena:{
      username: process.env.JENA_USER || 'admin',
      password: process.env.JENA_PASSWORD || '',
      host: process.env.JENA_HOST || 'http://localhost:3030',
      dataset: process.env.JENA_DATASET || 'nursing-home',
   },
   logging: {
      level: process.env.LOG_LEVEL?.toLowerCase()  || 'info',
   },
}
