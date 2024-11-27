export interface TimeSlot {
   hour: number;
   duration: number;
   activity: Activity;
   location: string;
 }
 
 export interface DailySchedule {
   residentId: string;
   defaultRoom: string;
   schedule: TimeSlot[];
 }
 
 export enum Activity {
   RESTING = 'RESTING',
   BREAKFAST = 'BREAKFAST',
   LUNCH = 'LUNCH',
   DINNER = 'DINNER',
   GROUP_ACTIVITY = 'GROUP_ACTIVITY',
   YARD_ACTIVITY = 'YARD_ACTIVITY',
   SOCIAL = 'SOCIAL'
 }