export interface Sensor {
   id: string;
   timestamp: string;
   sensorId: string;
   type: string; 
   value: string | number | boolean;
   location: {
     zoneId: string;
     zoneType: string;
   };
   person?: {
     id: string;
     name: string;
     type: string;
     preferredTemperature?: number;
   };
 }