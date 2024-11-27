import { ScheduleService } from './schedule.service';
import { Activity } from '../types/schedule';
import { logger } from '../utils/logger.service';

export class StaffService {
  private static instance: StaffService;
  private scheduleService: ScheduleService;
  private lastPatrolTime: Map<string, number>;
  private readonly PATROL_INTERVAL = 60000; // 1 hora simulada

  private constructor() {
    this.scheduleService = ScheduleService.getInstance();
    this.lastPatrolTime = new Map();
  }

  public static getInstance(): StaffService {
    if (!StaffService.instance) {
      StaffService.instance = new StaffService();
    }
    return StaffService.instance;
  }

  public getStaffLocation(staffId: string): string {
    const currentHour = this.scheduleService.getSimulatedHour();

    // Personal de limpieza
    if (staffId === 'staff1') {
      return this.getCleaningStaffLocation(currentHour);
    }

    // Enfermeras
    return this.getNurseLocation(staffId, currentHour);
  }

  private getNurseLocation(nurseId: string, currentHour: number): string {
    // Verificar actividades grupales activas
    const groupActivities = [Activity.GROUP_ACTIVITY, Activity.YARD_ACTIVITY];
    for (const activity of groupActivities) {
      const participants = this.scheduleService.getActivityParticipants(activity);
      if (participants.length > 0) {
        // Si hay actividad grupal, una enfermera siempre está presente
        if (participants.length > 0 && 
            (nurseId === 'nurse1' || 
             (nurseId === 'nurse2' && participants.length > 2))) {
          return participants[0].location;
        }
      }
    }

    // Horarios de comida
    if (this.isMealTime(currentHour)) {
      return 'dining-room';
    }

    // Rondas nocturnas más frecuentes
    if (currentHour >= 22 || currentHour < 6) {
      return this.getNightPatrolLocation(nurseId, currentHour);
    }

    // Rondas regulares durante el día
    return this.getPatrolLocation(nurseId, currentHour);
  }

  private getCleaningStaffLocation(currentHour: number): string {
    // Horarios específicos para limpieza
    if (currentHour >= 8 && currentHour < 10) {
      return 'dining-room'; // Limpieza después del desayuno
    }
    if (currentHour >= 14 && currentHour < 15) {
      return 'dining-room'; // Limpieza después del almuerzo
    }
    if (currentHour >= 20 && currentHour < 21) {
      return 'dining-room'; // Limpieza después de la cena
    }

    // Rotación de limpieza por zonas
    const cleaningSchedule = [
      'room1', 'room2', 'room3', 'room4', 'room5',
      'bathroom1', 'bathroom2', 'bathroom3', 'bathroom4', 'bathroom5',
      'living-room', 'yard'
    ];
    return cleaningSchedule[currentHour % cleaningSchedule.length];
  }

  private isMealTime(hour: number): boolean {
    return hour === 8 || hour === 13 || hour === 19;
  }

  private getNightPatrolLocation(nurseId: string, currentHour: number): string {
    const now = Date.now();
    const lastPatrol = this.lastPatrolTime.get(nurseId) || 0;

    if (now - lastPatrol >= this.PATROL_INTERVAL) {
      this.lastPatrolTime.set(nurseId, now);
      // Alternar entre habitaciones durante la noche
      return `room${(currentHour % 5) + 1}`;
    }

    return 'living-room'; // Punto de control nocturno
  }

  private getPatrolLocation(nurseId: string, currentHour: number): string {
    // Rotación de ubicaciones para rondas regulares
    const patrolZones = ['room1', 'room2', 'room3', 'room4', 'room5', 'living-room'];
    const offset = nurseId === 'nurse1' ? 0 : 3; // Las enfermeras empiezan en diferentes puntos
    return patrolZones[(currentHour + offset) % patrolZones.length];
  }
}