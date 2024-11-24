export interface Zone {
   id: string;
   name: string;
   type: 'ROOM' | 'BATHROOM' | 'LIVING_ROOM' | 'DINING_ROOM' | 'YARD';
   description?: string;
   defaultTemperature?: number;
 }
 
 export interface Person {
   id: string;
   type: 'resident' | 'nurse' | 'staff';
   name: string;
   preferredTemp?: number;
   roomId?: string;
   active: boolean;
 }
 
 export interface Sensor {
   id: string;
   type: 'LOCATION' | 'MOVEMENT';
   personId: string;
   description?: string;
   active: boolean;
 }
 
 export interface Actuator {
   id: string;
   type: 'TEMPERATURE' | 'LIGHT' | 'ALARM';
   zoneId: string;
   currentValue?: string;
   description?: string;
   active: boolean;
 }
 