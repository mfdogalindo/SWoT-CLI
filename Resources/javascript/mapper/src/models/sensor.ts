export enum SensorType {
   LOCATION = 'LOCATION',
   MOVEMENT = 'MOVEMENT'
}

export interface Sensor {
   id: string;
   type: SensorType;
   personId: string;
   location: string;
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface SensorReading {
   sensorId: string;
   timestamp: number;
   value: any;
   location: string;
}
