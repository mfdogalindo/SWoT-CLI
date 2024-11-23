import logging
from functools import lru_cache
from typing import Optional

from config.settings import get_settings
from mapper.sensor_mapper import build_sensor_detail
from models.api import Page
from models.sensor import SensorDetail
from repositories.jena import get_repository
from services.sparql_queries import SparqlQueries


class SensorService:
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.repository = get_repository()
        self.config = get_settings()
        self.app_url_prefix = self.config.SWOT_URL_PREFIX
        self.logger = logger or logging.getLogger(__name__)

    def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorDetail]:
        """Get sensor details by ID."""
        filter_clause = f'FILTER(?id = "{sensor_id}")'
        query = SparqlQueries.SENSOR_DETAILS_QUERY % (self.app_url_prefix, filter_clause, "")

        results = self.repository.query_result_set(query)

        if not results:
            return None

        return build_sensor_detail(results[0])

    def get_all_sensors(self, page: int = 0, size: int = 50) -> Page:
        """Get all sensors with pagination."""
        # Count total sensors
        count_query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        SELECT (COUNT(DISTINCT ?sensor) as ?count)
        WHERE {
            ?sensor rdf:type sosa:Sensor .
        }
        """

        count_results = self.repository.query_result_set(count_query)
        total_elements = int(count_results[0]['count']) if count_results else 0

        # Get paginated sensors
        pagination = f"ORDER BY ?id OFFSET {page * size} LIMIT {size}"
        query = SparqlQueries.SENSOR_DETAILS_QUERY % (self.app_url_prefix, "", pagination)

        results = self.repository.query_result_set(query)
        sensors = [build_sensor_detail(result) for result in results]

        return Page.of(sensors, page, size, total_elements)


@lru_cache()
def get_sensor_service(logger: Optional[logging.Logger] = None) -> SensorService:
    return SensorService(logger)
