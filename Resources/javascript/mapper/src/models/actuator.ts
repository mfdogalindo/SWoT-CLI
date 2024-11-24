export enum ActuatorType {
   TEMPERATURE = 'TEMPERATURE',
   LIGHT = 'LIGHT',
   ALARM = 'ALARM'
}

export interface Actuator {
   id: string;
   type: ActuatorType;
   location: string;
   currentValue: any;
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface ActuatorCommand {
   actuatorId: string;
   command: any;
   timestamp: number;
}