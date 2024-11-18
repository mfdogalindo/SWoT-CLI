import logging
from typing import Dict

from interfaces.message_publisher import MessagePublisher
from models.sensor_location import SensorLocation
from services.sensor_data_generator import SensorDataGenerator


class SensorSimulator:
    """Main service coordinating the sensor simulation."""

    def __init__(self,
                 publisher: MessagePublisher,
                 data_generator: SensorDataGenerator,
                 topic: str):
        self.publisher = publisher
        self.data_generator = data_generator
        self.topic = topic
        self.sensor_locations = self._initialize_sensor_locations()
        self.logger = logging.getLogger(__name__)

    def _initialize_sensor_locations(self) -> Dict[str, SensorLocation]:
        """Initialize fixed sensor locations."""
        return {
            "NODE-001": SensorLocation(2.4422, -76.6122, "ZONE-NORTH"),
            "NODE-002": SensorLocation(2.4431, -76.6131, "ZONE-NORTH"),
            "NODE-003": SensorLocation(2.4440, -76.6140, "ZONE-SOUTH"),
            "NODE-004": SensorLocation(2.4449, -76.6149, "ZONE-SOUTH"),
            "NODE-005": SensorLocation(2.4458, -76.6158, "ZONE-EAST"),
            "NODE-006": SensorLocation(2.4467, -76.6167, "ZONE-EAST"),
            "NODE-007": SensorLocation(2.4476, -76.6176, "ZONE-WEST"),
            "NODE-008": SensorLocation(2.4485, -76.6185, "ZONE-WEST"),
            "NODE-009": SensorLocation(2.4494, -76.6194, "ZONE-CENTRAL"),
            "NODE-010": SensorLocation(2.4503, -76.6203, "ZONE-CENTRAL"),
        }

    def simulate_readings(self) -> None:
        """Generate and publish readings for all sensors."""
        try:
            for sensor_id, location in self.sensor_locations.items():
                reading = self.data_generator.generate_reading(sensor_id, location)
                self.publisher.publish(self.topic, reading)
                self.logger.info(f"Published data for sensor {sensor_id}")
        except Exception as e:
            self.logger.error(f"Error simulating sensor readings: {str(e)}")
            raise
