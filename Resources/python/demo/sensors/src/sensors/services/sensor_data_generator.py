from typing import Dict
import random
from sensors.models.sensor_reading import SensorReading
from sensors.models.sensor_location import SensorLocation

class SensorDataGenerator:
    """Service responsible for generating simulated sensor data."""
    
    def __init__(self):
        self.random = random.Random()
        
    def generate_reading(self, sensor_id: str, location: SensorLocation) -> SensorReading:
        """Generate a single sensor reading with random but realistic values."""
        return SensorReading.create(
            sensor_id=sensor_id,
            temperature=15 + (self.random.random() * 25),  # 15°C - 40°C
            humidity=30 + (self.random.random() * 70),     # 30% - 100%
            aqi=50 + self.random.randint(0, 300),         # 50 - 350 AQI
            noise=30 + (self.random.random() * 70),       # 30 dB - 100 dB
            latitude=location.latitude,
            longitude=location.longitude,
            zone=location.zone
        )