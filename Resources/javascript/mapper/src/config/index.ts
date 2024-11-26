import dotenv from 'dotenv';

dotenv.config();

export const config = {
   mqtt: {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883'),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
   },
   dbConfig: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'nursing_home_user',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.DB_NAME || 'nursing_home_db'
    },
    redisConfig: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '3600') // 1 hour in seconds
    },
   topics: {
      sensors: process.env.SENSORS_TOPIC || 'nursing-home/sensors',
      actuators: {
         state: process.env.ACTUATOR_STATE_TOPIC || 'nursing-home/actuators/state',
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
