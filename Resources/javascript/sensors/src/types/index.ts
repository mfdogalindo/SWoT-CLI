export enum SensorType {
  LOCATION = 'LOCATION',
  MOVEMENT = 'MOVEMENT',
}

export enum ActuatorType {
  TEMPERATURE = 'TEMPERATURE',
  LIGHT = 'LIGHT',
  ALARM = 'ALARM',
}

export enum ZoneType {
  ROOM = 'ROOM',
  BATHROOM = 'BATHROOM',
  LIVING_ROOM = 'LIVING_ROOM',
  DINING_ROOM = 'DINING_ROOM',
  YARD = 'YARD',
}

export interface Location {
  zoneId: string;
  zoneType: ZoneType;
}

export interface SensorData {
  sensorId: string;
  type: SensorType;
  timestamp: number;
  value: any;
  location: Location;
}

export interface ActuatorData {
  actuatorId: string;
  type: ActuatorType;
  timestamp: number;
  value: any;
  location: Location;
}

export interface ActuatorCommand {
  type: CommandType;
  actuatorId?: string;
  command?: any;
}

export interface ActuatorState {
  actuatorId: string;
  type: ActuatorType;
  value: any;
  timestamp: number;
  location: Location;
}

export enum CommandType {
  UPDATE_VALUE = 'UPDATE_VALUE',
  REQUEST_STATE = 'REQUEST_STATE',
}
