export enum SensorType {
   LOCATION = 'LOCATION',
   MOVEMENT = 'MOVEMENT'
 }
 
 export enum ActuatorType {
   TEMPERATURE = 'TEMPERATURE',
   LIGHT = 'LIGHT',
   ALARM = 'ALARM'
 }
 
 export enum ZoneType {
   ROOM = 'ROOM',
   BATHROOM = 'BATHROOM',
   LIVING_ROOM = 'LIVING_ROOM',
   DINING_ROOM = 'DINING_ROOM',
   YARD = 'YARD'
 }
 
 export enum MovementValue {
   NORMAL = 'NORMAL',
   FALL = 'FALL'
 }
 
 export interface Location {
   zoneId: string;
   zoneType: ZoneType;
 }
 
 export interface SensorData {
   sensorId: string;
   type: SensorType;
   timestamp: number;
   value: string | MovementValue; // string for location, MovementValue for movement
   location: Location;
 }
 
 export interface ActuatorData {
   actuatorId: string;
   type: ActuatorType;
   value: boolean | number; // boolean for LIGHT/ALARM, number for TEMPERATURE
   timestamp: number;
   location: Location;
 }
 
 export interface ActuatorCommand {
   actuatorId: string;
   command: boolean | number; // boolean for LIGHT/ALARM, number for TEMPERATURE
 }
 
 // Ejemplo de estructura para eventos/alertas
 export interface FallAlert {
   timestamp: number;
   sensorId: string;
   personId: string;
   location: Location;
 }