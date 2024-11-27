import { DailySchedule, Activity, TimeSlot } from '../types/schedule';
import { ZoneType } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class ScheduleService {
   private static instance: ScheduleService;
   private simulationStartTime: number;
   private readonly SIMULATION_HOUR = 60000; // 1 minute = 1 hour in simulation
   private currentActivities: Map<string, Activity>;
   private schedules: Map<string, DailySchedule>;

   private constructor() {
      this.simulationStartTime = Date.now() - (7 * this.SIMULATION_HOUR);
      this.currentActivities = new Map();
      this.schedules = new Map();
   }

   public static getInstance(): ScheduleService {
      if (!ScheduleService.instance) {
         ScheduleService.instance = new ScheduleService();
      }
      return ScheduleService.instance;
   }

   public getSimulatedHour(): number {
      const elapsedTime = Date.now() - this.simulationStartTime;
      return Math.floor((elapsedTime / this.SIMULATION_HOUR) % 24);
   }

   public getSimulatedMinute(): number {
      const elapsedTime = Date.now() - this.simulationStartTime;
      return Math.floor((elapsedTime / (this.SIMULATION_HOUR / 60)) % 60);
   }

   public resetSimulation(): void {
      this.simulationStartTime = Date.now();
   }

   public getSimulatedTimeString(): string {
      return `${this.getSimulatedHour().toString().padStart(2, '0')}:${this.getSimulatedMinute().toString().padStart(2, '0')}`;
   }
   public generateResidentSchedule(residentId: string, defaultRoom: string): DailySchedule {
      const schedule: TimeSlot[] = [
         // Comidas
         {
            hour: config.simulation.residents.mealTimes.breakfast.start,
            duration: config.simulation.residents.mealTimes.breakfast.duration,
            activity: Activity.BREAKFAST,
            location: 'dining-room'
         },
         {
            hour: config.simulation.residents.mealTimes.lunch.start,
            duration: config.simulation.residents.mealTimes.lunch.duration,
            activity: Activity.LUNCH,
            location: 'dining-room'
         },
         {
            hour: config.simulation.residents.mealTimes.dinner.start,
            duration: config.simulation.residents.mealTimes.dinner.duration,
            activity: Activity.DINNER,
            location: 'dining-room'
         },

         // Actividades grupales
         {
            hour: config.simulation.residents.activities.morning.start,
            duration: config.simulation.residents.activities.morning.duration,
            activity: Activity.GROUP_ACTIVITY,
            location: 'living-room'
         },
         {
            hour: config.simulation.residents.activities.afternoon.start,
            duration: config.simulation.residents.activities.afternoon.duration,
            activity: Activity.YARD_ACTIVITY,
            location: 'yard'
         },
         {
            hour: config.simulation.residents.activities.evening.start,
            duration: config.simulation.residents.activities.evening.duration,
            activity: Activity.SOCIAL,
            location: 'living-room'
         }

      ];

      const residentSchedule = { residentId, defaultRoom, schedule };
      this.schedules.set(residentId, residentSchedule);
      return residentSchedule;
   }

   public getCurrentLocation(schedule: DailySchedule): string {
      const currentHour = this.getSimulatedHour();
      const currentActivity = this.findCurrentActivity(schedule, currentHour);

      if (currentActivity) {
         this.updateCurrentActivity(schedule.residentId, currentActivity.activity);
         // this.logActivityChange(schedule.residentId, currentActivity);
         return currentActivity.location;
      }

      return schedule.defaultRoom;
   }

   private findCurrentActivity(schedule: DailySchedule, currentHour: number): TimeSlot | null {
      return schedule.schedule.find(slot => {
         const endHour = (slot.hour + slot.duration) % 24;
         if (slot.hour < endHour) {
            return currentHour >= slot.hour && currentHour < endHour;
         } else {
            // Manejar actividades que cruzan la medianoche
            return currentHour >= slot.hour || currentHour < endHour;
         }
      }) || null;
   }

   private updateCurrentActivity(residentId: string, activity: Activity): void {
      const previousActivity = this.currentActivities.get(residentId);
      if (previousActivity !== activity) {
         this.currentActivities.set(residentId, activity);
      }
   }

   private logActivityChange(residentId: string, timeSlot: TimeSlot): void {
      logger.info(
         `[${this.getSimulatedHour()}:00] ${residentId} - ${timeSlot.activity} at ${timeSlot.location}`
      );
   }

   public getActivityParticipants(activity: Activity): { residentId: string, location: string }[] {
      const participants: { residentId: string, location: string }[] = [];
      this.currentActivities.forEach((currentActivity, residentId) => {
         if (currentActivity === activity) {
            const schedule = this.getResidentSchedule(residentId);
            if (schedule) {
               const currentLocation = this.getCurrentLocation(schedule);
               participants.push({
                  residentId,
                  location: currentLocation
               });
            }
         }
      });
      return participants;
   }

   private getResidentSchedule(residentId: string): DailySchedule | null {
      const schedule = Array.from(this.schedules.values())
         .find(schedule => schedule.residentId === residentId);
      return schedule || null;
   }
}
