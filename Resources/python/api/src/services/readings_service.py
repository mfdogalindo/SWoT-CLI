import logging
from functools import lru_cache
from typing import Optional

from config.settings import get_settings
from mapper.sensor_mapper import build_sensor_reading
from models.api import Page
from models.sensor import SensorType
from repositories.jena import get_repository
from services.sparql_queries import SparqlQueries


class ReadingsService:
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.repository = get_repository()
        self.config = get_settings()
        self.app_url_prefix = self.config.SWOT_URL_PREFIX
        self.logger = logger or logging.getLogger(__name__)

    def get_readings_by_type(self, sensor_type: SensorType, page: int = 0, size: int = 50) -> Page:
        """Get sensor readings by type with pagination."""
        # Get total count
        count_query = SparqlQueries.COUNT_QUERY % sensor_type.value
        count_results = self.repository.query_result_set(count_query)
        total_elements = int(count_results[0]['count']) if count_results else 0

        # Get readings
        query = SparqlQueries.BASE_QUERY % (
            self.app_url_prefix,
            self.app_url_prefix,
            sensor_type.value,
            page * size,
            size
        )

        results = self.repository.query_result_set(query)
        readings = [build_sensor_reading(result) for result in results]

        return Page.of(readings, page, size, total_elements)


@lru_cache
def get_readings_service(logger: Optional[logging.Logger] = None) -> ReadingsService:
    return ReadingsService(logger)
