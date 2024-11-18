import logging
import random

from models.sensor_location import SensorLocation
from models.sensor_reading import SensorReading


class SensorDataGenerator:
    """Service responsible for generating simulated sensor data."""

    def __init__(self):
        self.random = random.Random()
        self.logger = logging.getLogger(__name__)
        self.logger.info("Sensor data generator initialized")

    def generate_reading(self, sensor_id: str, location: SensorLocation) -> SensorReading:
        """Generate a single sensor reading with random but realistic values."""
        return SensorReading.create(
            id=sensor_id,
            temperature=15 + (self.random.random() * 25),  # 15°C - 40°C
            humidity=30 + (self.random.random() * 70),  # 30% - 100%
            airQuality=50 + self.random.randint(0, 300),  # 50 - 350 AQI
            noiseLevel=30 + (self.random.random() * 70),  # 30 dB - 100 dB
            latitude=location.latitude,
            longitude=location.longitude,
            zone=location.zone
        )
