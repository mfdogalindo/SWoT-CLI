import logging
from datetime import datetime
from enum import Enum
from functools import lru_cache
from typing import Optional

from config.settings import get_settings
from models.api import Page
from models.sensor import SensorReadingAlert, SensorType
from repositories.jena import get_repository
from services.sparql_queries import SparqlQueries


class AlertSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class AlertsService:
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.repository = get_repository()
        self.config = get_settings()
        self.app_url_prefix = self.config.SWOT_URL_PREFIX
        self.logger = logger or logging.getLogger(__name__)
        self.queries = SparqlQueries()

    def get_alerts_by_type(self, sensor_type: SensorType, page: int = 0, size: int = 50) -> Page:
        """Get alerts for a specific sensor type with pagination."""
        try:
            # Get total count of alerts
            count_query = self.queries.COUNT_ALERTS_QUERY % (
                self.app_url_prefix,
                sensor_type.value
            )
            logging.debug("Count query: %s", count_query)
            count_results = self.repository.query_result_set(count_query)
            logging.debug("Count results: %s", count_results)
            total_elements = int(count_results[0]['count']) if count_results else 0

            # Get alerts for the requested page
            query = self.queries.READINGS_WITH_ALERTS_QUERY % (
                self.app_url_prefix,
                sensor_type.value,
                page * size,
                size
            )

            logging.debug("Alerts query: %s", query)
            results = self.repository.query_result_set(query)
            logging.debug("Alerts results: %s", results)
            alerts = [self._build_alert(result) for result in results]

            return Page.of(alerts, page, size, total_elements)

        except Exception as e:
            self.logger.error(f"Error getting alerts for sensor type {sensor_type}: {str(e)}")
            raise

    def _build_alert(self, result: dict) -> SensorReadingAlert:
        """Build a SensorReadingAlert object from a query result."""
        try:
            return SensorReadingAlert(
                sensor_id=result['sensorId'],
                value=float(result['value']),
                unit=result['unit'],
                timestamp=datetime.fromisoformat(result['timestamp']),
                alert_type=result['alertType'],
                severity=result['severity'],
                message=result['message']
            )
        except KeyError as e:
            self.logger.error(f"Missing required field in alert data: {str(e)}")
            raise
        except ValueError as e:
            self.logger.error(f"Error parsing alert data: {str(e)}")
            raise

    def get_alerts_by_severity(self, severity: AlertSeverity, page: int = 0, size: int = 50) -> Page:
        """Get alerts filtered by severity level."""
        severity_query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX alert: <%salert#>

        SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?alertType ?severity ?message
        WHERE {
            ?sensor rdf:type sosa:Sensor .
            BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?sensorId)

            ?observation sosa:hasFeatureOfInterest ?sensor ;
                        sosa:resultTime ?timestamp ;
                        sosa:hasResult ?result ;
                        alert:hasAlert ?alertType ;
                        alert:severity "%s" ;
                        alert:message ?message .

            ?result qudt:numericValue ?value ;
                    qudt:unit ?unitResource .

            BIND(REPLACE(str(?unitResource), "^.*/unit/", "") as ?unit)
            BIND("%s" as ?severity)
        }
        ORDER BY DESC(?timestamp)
        OFFSET %d
        LIMIT %d
        """ % (self.app_url_prefix, severity.value, severity.value, page * size, size)

        try:
            results = self.repository.query_result_set(severity_query)
            alerts = [self._build_alert(result) for result in results]

            # Get total count for severity
            count_query = """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX alert: <%salert#>

            SELECT (COUNT(DISTINCT ?observation) as ?count)
            WHERE {
                ?observation alert:severity "%s" .
            }
            """ % (self.app_url_prefix, severity.value)

            count_results = self.repository.query_result_set(count_query)
            total_elements = int(count_results[0]['count']) if count_results else 0

            return Page.of(alerts, page, size, total_elements)

        except Exception as e:
            self.logger.error(f"Error getting alerts for severity {severity}: {str(e)}")
            raise

    def get_alerts_by_sensor(self, sensor_id: str, page: int = 0, size: int = 50) -> Page:
        """Get all alerts for a specific sensor."""
        sensor_query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX alert: <%salert#>

        SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?alertType ?severity ?message
        WHERE {
            ?sensor rdf:type sosa:Sensor .
            BIND("%s" as ?sensorId)
            FILTER(REPLACE(str(?sensor), "^.*/sensor/", "") = ?sensorId)

            ?observation sosa:hasFeatureOfInterest ?sensor ;
                        sosa:resultTime ?timestamp ;
                        sosa:hasResult ?result ;
                        alert:hasAlert ?alertType ;
                        alert:severity ?severity ;
                        alert:message ?message .

            ?result qudt:numericValue ?value ;
                    qudt:unit ?unitResource .

            BIND(REPLACE(str(?unitResource), "^.*/unit/", "") as ?unit)
        }
        ORDER BY DESC(?timestamp)
        OFFSET %d
        LIMIT %d
        """ % (self.app_url_prefix, sensor_id, page * size, size)

        try:
            results = self.repository.query_result_set(sensor_query)
            alerts = [self._build_alert(result) for result in results]

            # Get total count for sensor
            count_query = """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>

            SELECT (COUNT(DISTINCT ?observation) as ?count)
            WHERE {
                ?sensor rdf:type sosa:Sensor .
                FILTER(REPLACE(str(?sensor), "^.*/sensor/", "") = "%s")
                ?observation sosa:hasFeatureOfInterest ?sensor ;
                            alert:hasAlert ?alertType .
            }
            """ % sensor_id

            count_results = self.repository.query_result_set(count_query)
            total_elements = int(count_results[0]['count']) if count_results else 0

            return Page.of(alerts, page, size, total_elements)

        except Exception as e:
            self.logger.error(f"Error getting alerts for sensor {sensor_id}: {str(e)}")
            raise

    def get_latest_alerts(self, limit: int = 10) -> list[SensorReadingAlert]:
        """Get the most recent alerts across all sensors."""
        latest_query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX alert: <%salert#>

        SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?alertType ?severity ?message
        WHERE {
            ?sensor rdf:type sosa:Sensor .
            BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?sensorId)

            ?observation sosa:hasFeatureOfInterest ?sensor ;
                        sosa:resultTime ?timestamp ;
                        sosa:hasResult ?result ;
                        alert:hasAlert ?alertType ;
                        alert:severity ?severity ;
                        alert:message ?message .

            ?result qudt:numericValue ?value ;
                    qudt:unit ?unitResource .

            BIND(REPLACE(str(?unitResource), "^.*/unit/", "") as ?unit)
        }
        ORDER BY DESC(?timestamp)
        LIMIT %d
        """ % (self.app_url_prefix, limit)

        try:
            results = self.repository.query_result_set(latest_query)
            return [self._build_alert(result) for result in results]
        except Exception as e:
            self.logger.error(f"Error getting latest alerts: {str(e)}")
            raise


@lru_cache
def get_alerts_service(logger: Optional[logging.Logger] = None) -> AlertsService:
    return AlertsService(logger)
