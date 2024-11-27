// src/simulators/behavior.simulator.ts
import { log } from 'console';
import { config } from '../config';
import { ScheduleService } from '../services/schedule.service';
import { StaffService } from '../services/staff.service';
import { SensorData, SensorType, ZoneType, Location } from '../types';
import { Activity, DailySchedule } from '../types/schedule';
import { logger } from '../utils/logger.service';
import { mqttService } from './mqtt.service';

export class BehaviorSimulator {
  private scheduleService: ScheduleService;
  private staffService: StaffService;
  private residentSchedules: Map<string, DailySchedule>;
  private lastLoggedHour: number = -1;
  private sensors: Map<string, { type: SensorType, location: Location }>;

  constructor() {
    this.scheduleService = ScheduleService.getInstance();
    this.staffService = StaffService.getInstance();
    this.residentSchedules = new Map();
    this.sensors = new Map();
    this.initializeSchedules();
    this.initializeSensors();
    this.startSimulation();
  }

  private initializeSensors(): void {
    // Inicializar sensores para residentes
    const residents = ['resident1', 'resident2', 'resident3', 'resident4', 'resident5'];
    residents.forEach((residentId, index) => {
      const defaultRoom = `room${index + 1}`;
      
      // Sensor de ubicación
      this.sensors.set(`location_${residentId}`, {
        type: SensorType.LOCATION,
        location: { zoneId: defaultRoom, zoneType: ZoneType.ROOM }
      });

      // Sensor de movimiento
      this.sensors.set(`movement_${residentId}`, {
        type: SensorType.MOVEMENT,
        location: { zoneId: defaultRoom, zoneType: ZoneType.ROOM }
      });
    });

    // Inicializar sensores para personal
    ['nurse1', 'nurse2', 'staff1'].forEach(staffId => {
      this.sensors.set(`location_${staffId}`, {
        type: SensorType.LOCATION,
        location: { zoneId: 'living-room', zoneType: ZoneType.LIVING_ROOM }
      });
    });
  }

  private startSimulation(): void {
    // Publicar actualizaciones de sensores cada 5 segundos
    setInterval(() => {
      this.publishSensorUpdates();
    }, config.simulation.updateInterval);

    // Seguimiento de tiempo y actividades
    this.startTimeTracking();
  }

  private publishSensorUpdates(): void {
    this.sensors.forEach((sensorInfo, sensorId) => {
      // Actualizar ubicación si es un sensor de ubicación
      if (sensorInfo.type === SensorType.LOCATION) {
        this.updateSensorLocation(sensorId, sensorInfo);
      }

      // Generar y publicar datos del sensor
      const data: SensorData = {
        sensorId,
        type: sensorInfo.type,
        timestamp: Date.now(),
        value: this.generateSensorValue(sensorId, sensorInfo),
        location: sensorInfo.location
      };

      mqttService.publish(config.topics.sensors, data);
    });
  }

  private updateSensorLocation(sensorId: string, sensorInfo: { type: SensorType, location: Location }): void {
    const entityId = sensorId.split('_')[1];
    let newZoneId: string;

    if (sensorId.startsWith('location_resident')) {
      newZoneId = this.getResidentLocation(entityId);
    } else if (sensorId.startsWith('location_')) {
      newZoneId = this.getStaffLocation(entityId);
    } else {
      return;
    }

    sensorInfo.location = {
      zoneId: newZoneId,
      zoneType: this.getZoneType(newZoneId)
    };
  }

  private generateSensorValue(sensorId: string, sensorInfo: { type: SensorType, location: Location }): any {
    switch (sensorInfo.type) {
      case SensorType.LOCATION:
        return sensorInfo.location.zoneId;
      case SensorType.MOVEMENT:
        const currentHour = this.scheduleService.getSimulatedHour();
        const isNightTime = currentHour >= 22 || currentHour < 6;
        const baseProbability = isNightTime ? 0.05 : 0.02;
        const isAFall = Math.random() < baseProbability;
        if (isAFall)
          logger.info('Fall detected for resident {} at {}', sensorId, sensorInfo.location.zoneId);
        return isAFall ? 'FALL_DETECTED' : 'NORMAL';
      default:
        return null;
    }
  }

  private getZoneType(zoneId: string): ZoneType {
    const zone = config.zones.rooms.find(z => z.id === zoneId);
    return zone ? zone.type : ZoneType.LIVING_ROOM;
  }
  
  private initializeSchedules(): void {
    const residents = ['resident1', 'resident2', 'resident3', 'resident4', 'resident5'];
    residents.forEach((residentId, index) => {
      const defaultRoom = `room${index + 1}`;
      const schedule = this.scheduleService.generateResidentSchedule(residentId, defaultRoom);
      this.residentSchedules.set(residentId, schedule);
    });
    logger.info('Initialized schedules for {} residents', residents.length);
  }

  private startTimeTracking(): void {
    setInterval(() => {
      const currentHour = this.scheduleService.getSimulatedHour();
      if (currentHour !== this.lastLoggedHour) {
        this.lastLoggedHour = currentHour;
        this.logCurrentActivities(currentHour);
      }
    }, 1000); // Verificar cada segundo
  }

  private logCurrentActivities(hour: number): void {
    logger.info('=== Hour {}:00 ===', hour);
    
    // Registrar ubicación de cada residente
    this.residentSchedules.forEach((schedule, residentId) => {
      const location = this.scheduleService.getCurrentLocation(schedule);
      logger.info(`${residentId} is at ${location}`);
    });

    // Registrar ubicación del personal
    ['nurse1', 'nurse2', 'staff1'].forEach(staffId => {
      const location = this.staffService.getStaffLocation(staffId);
      logger.info(`${staffId} is at ${location}`);
    });

    // Registrar actividades grupales
    const groupActivities = [Activity.GROUP_ACTIVITY, Activity.YARD_ACTIVITY, Activity.SOCIAL];
    groupActivities.forEach(activity => {
      const participants = this.scheduleService.getActivityParticipants(activity);
      if (participants.length > 0) {
        const participantInfo = participants.map(p => 
          `${p.residentId} (${p.location})`).join(', ');
        logger.info(`${activity} participants: ${participantInfo}`);
      }
    });

    logger.info('==================');
  }

  public getResidentLocation(residentId: string): string {
    const schedule = this.residentSchedules.get(residentId);
    if (!schedule) {
      logger.error(`No schedule found for resident ${residentId}`);
      return 'living-room';
    }
    return this.scheduleService.getCurrentLocation(schedule);
  }

  public getStaffLocation(staffId: string): string {
    return this.staffService.getStaffLocation(staffId);
  }
}