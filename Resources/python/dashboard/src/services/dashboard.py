# API Client Interface
import logging
from functools import lru_cache
from typing import Optional
from urllib.parse import urljoin
import requests

from config.settings import get_settings
from models.api import Page
from models.sensors import SensorType, SensorReading, SensorReadingAlert, SensorDetail


class DashboardApiClient:
    """Interface for dashboard API operations"""

    def get_sensor_readings(self, sensor_type: SensorType, page: int, size: int) -> Page[SensorReading]:
        raise NotImplementedError

    def get_sensor_alerts(self, sensor_type: SensorType, page: int, size: int) -> Page[SensorReadingAlert]:
        raise NotImplementedError

    def get_all_sensors(self, page: int, size: int) -> Page[SensorDetail]:
        raise NotImplementedError

    def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorDetail]:
        raise NotImplementedError


# Implementation
class RestDashboardApiClient(DashboardApiClient):
    """REST implementation of the dashboard API client"""

    def __init__(self):
        self.config = get_settings()
        self.base_url = self.config.API_URL
        self.session = requests.Session()

    def _make_request(self, endpoint: str, params: Optional[dict] = None) -> Optional[dict]:
        """Make HTTP request with error handling"""
        try:
            url = urljoin(self.base_url, endpoint)
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            # Log error here
            print(f"Error making request to {endpoint}: {str(e)}")
            return None

    def get_sensor_readings(self, sensor_type: SensorType, page: int, size: int) -> Page[SensorReading]:
        endpoint = f"/api/v1/environment/{sensor_type.endpoint}"
        data = self._make_request(endpoint, params={"page": page, "size": size})

        ### logging.debug(f"Data: {data}")

        if not data:
            return Page.empty()

        return Page[SensorReading](**data)

    def get_sensor_alerts(self, sensor_type: SensorType, page: int, size: int) -> Page[SensorReadingAlert]:
        endpoint = f"/api/v1/alerts/{sensor_type.endpoint}"
        data = self._make_request(endpoint, params={"page": page, "size": size})

        ### logging.debug(f"Alerts Data: {data}")

        if not data:
            return Page.empty()

        return Page[SensorReadingAlert](**data)

    def get_all_sensors(self, page: int, size: int) -> Page[SensorDetail]:
        endpoint = "/api/v1/sensor"
        data = self._make_request(endpoint, params={"page": page, "size": size})

        if not data:
            return Page.empty()

        return Page[SensorDetail](**data)

    def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorDetail]:
        endpoint = f"/api/v1/sensor/{sensor_id}"
        data = self._make_request(endpoint)

        if not data:
            return None

        return SensorDetail(**data)


# Service layer with singleton pattern using lru_cache
class DashboardService:
    """Service layer for dashboard operations"""

    def __init__(self, api_client: DashboardApiClient):
        self.api_client = api_client

    def get_sensor_readings(self, sensor_type: SensorType, page: int = 0, size: int = 10) -> Page[SensorReading]:
        return self.api_client.get_sensor_readings(sensor_type, page, size)

    def get_sensor_alerts(self, sensor_type: SensorType, page: int = 0, size: int = 5) -> Page[SensorReadingAlert]:
        return self.api_client.get_sensor_alerts(sensor_type, page, size)

    def get_all_sensors(self, page: int = 0, size: int = 50) -> Page[SensorDetail]:
        return self.api_client.get_all_sensors(page, size)

    def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorDetail]:
        return self.api_client.get_sensor_by_id(sensor_id)


@lru_cache(maxsize=1)
def get_dashboard_service() -> DashboardService:
    """Factory function to get singleton instance of DashboardService"""
    api_client = RestDashboardApiClient()
    return DashboardService(api_client)