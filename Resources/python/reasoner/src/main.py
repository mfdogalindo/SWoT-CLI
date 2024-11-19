import logging
import os

from scheduler.scheduler import SchedulerService
from services.semantic_reasoner import SemanticReasoner

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO)
)

logger = logging.getLogger(__name__)


def main():
    # Create scheduler service
    scheduler_service = SchedulerService(logger)

    # Create and add task
    task = SemanticReasoner(logger)
    scheduler_service.add_job(task, "semantic_reasoner")

    # Run scheduler
    scheduler_service.start()

if __name__ == "__main__":
    main()
