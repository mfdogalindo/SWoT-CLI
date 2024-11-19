import logging
from typing import Optional
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from config.settings import get_settings
from scheduler.interfaces import TaskHandler

class SchedulerService:
    """Service class for managing scheduled tasks with BlockingScheduler."""

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.config = get_settings()
        self.logger = logger or logging.getLogger(__name__)
        self.scheduler = self._create_scheduler()

    def _create_scheduler(self) -> BlockingScheduler:
        """Create and configure the scheduler instance."""
        return BlockingScheduler(
            timezone=self.config.TIMEZONE,
            job_defaults={
                'coalesce': self.config.JOB_COALESCE,
                'max_instances': self.config.MAX_INSTANCES,
                'misfire_grace_time': self.config.JOB_MISFIRE_GRACE_TIME
            }
        )

    def add_job(self, task_handler: TaskHandler, task_id: str) -> None:
        """
        Add a new job to the scheduler.

        Args:
            task_handler: Implementation of TaskHandler to execute
            task_id: Unique identifier for the task
        """
        if not isinstance(task_handler, TaskHandler):
            raise ValueError("task_handler must implement TaskHandler interface")

        trigger = IntervalTrigger(
            seconds=self.config.SCHEDULER_INTERVAL_SECONDS,
            timezone=self.config.TIMEZONE
        )

        self.scheduler.add_job(
            func=self._execute_task,
            trigger=trigger,
            args=[task_handler],
            id=task_id,
            name=task_id
        )
        self.logger.info(f"Added job {task_id} to scheduler")

    def _execute_task(self, task_handler: TaskHandler) -> None:
        """
        Execute the task and handle any errors.

        Args:
            task_handler: The task handler to execute
        """
        try:
            task_handler.execute()
        except Exception as e:
            self.logger.error(f"Error executing task: {str(e)}")
            task_handler.handle_error(e)

    def start(self) -> None:
        """Start the scheduler service."""
        self.logger.info("Starting BlockingScheduler service")
        try:
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            self.logger.info("Scheduler stopped by user")

    def stop(self) -> None:
        """Stop the scheduler service."""
        self.scheduler.shutdown(wait=False)
        self.logger.info("Scheduler service stopped")
