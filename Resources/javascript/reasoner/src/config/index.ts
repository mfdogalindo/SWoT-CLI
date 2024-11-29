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
      sensors: process.env.SENSORS_TOPIC || 'nursing-home/sensors',
      actuators: {
         state: process.env.ACTUATOR_STATE_TOPIC || 'nursing-home/actuators/state',
         stateRequest:
            process.env.ACTUATOR_STATE_REQUEST_TOPIC ||
            'nursing-home/actuators/state/request',
         command: process.env.ACTUATOR_COMMAND_TOPIC || 'nursing-home/actuators/command',
      },
      semantic: {
         sensors: process.env.SEMANTIC_SENSOR_TOPIC || 'nursing-home/semantic/sensors',
         actuators: process.env.SEMANTIC_ACTUATOR_TOPIC || 'nursing-home/semantic/actuators'
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
   reasoner: {
      temperatureCheckInterval: parseInt(process.env.TEMP_CHECK_INTERVAL || '10000'),
      defaultEmptyRoomTemp: parseFloat(process.env.DEFAULT_EMPTY_ROOM_TEMP || '25'),
      checkFallInterval: parseInt(process.env.CHECK_FALL_INTERVAL || '5000'),
      alarmDuration: parseInt(process.env.ALARM_DURATION || '10000'),
   },
}
