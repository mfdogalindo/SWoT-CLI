export interface Actuator {
   id: string;
   timestamp: string;
   actuatorId: string;
   type: string;
   value: string | number | boolean;
   location: {
     zoneId: string;
     zoneType: string;
   };
 }