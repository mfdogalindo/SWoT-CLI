// src/types/index.ts
export interface Person {
   id: string;
   name: string;
   type: 'resident' | 'nurse' | 'staff';
   preferredTemperature?: number;
   location: Location;
 }
 
 export interface Location {
   zoneId: string;
   zoneType: 'ROOM' | 'BATHROOM' | 'LIVING_ROOM' | 'DINING_ROOM' | 'YARD';
 }
 
 export interface SensorData {
   id: string;
   timestamp: string;
   sensorId: string;
   type: string;
   value: string | number | boolean;
   location: Location;
   person?: Person;
 }
 
 export interface ActuatorData {
   id: string;
   timestamp: string;
   actuatorId: string;
   type: string;
   value: string | number | boolean;
   location: Location;
 }
 
 export interface Zone {
   id: string;
   type: Location['zoneType'];
   label: string;
   residents: Person[];
   staff: Person[];
   actuators: ActuatorData[];
 }