import { CronJob } from 'cron';
import { mappingService } from './mapping.service';
import { jenaService } from './jena.service';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SchedulerService {
  private static instance: SchedulerService;
  private actuatorRefreshJob: CronJob;
  private dataCleanupJob: CronJob;

  private constructor() {
    // Actualizar estado de actuadores cada 10 minutos
    this.actuatorRefreshJob = new CronJob('*/10 * * * *', async () => {
      try {
        logger.info('Executing actuator refresh job');
        await mappingService.refreshActuators();
      } catch (error) {
        logger.error('Error in actuator refresh job:', error);
      }
    });

    // Limpiar datos antiguos cada día a las 00:00
    this.dataCleanupJob = new CronJob('0 0 * * *', async () => {
      try {
        if (config.app.enableDataCleanup) {
          logger.info('Executing data cleanup job');
          await this.cleanupOldData();
        }
      } catch (error) {
        logger.error('Error in data cleanup job:', error);
      }
    });
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public startJobs(): void {
    this.actuatorRefreshJob.start();
    if (config.app.enableDataCleanup) {
      this.dataCleanupJob.start();
    }
    logger.info('Scheduler jobs started');
  }

  public stopJobs(): void {
    this.actuatorRefreshJob.stop();
    this.dataCleanupJob.stop();
    logger.info('Scheduler jobs stopped');
  }

  private async cleanupOldData(): Promise<void> {
    try {
      // Eliminar datos antiguos de Jena (últimas 24 horas)
      const retentionPeriodHours = config.app.dataRetentionPeriod / 3600;
      await jenaService.deleteOldData(retentionPeriodHours);
      
      // También podríamos limpiar caché si es necesario
      logger.info('Old data cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

export const schedulerService = SchedulerService.getInstance();