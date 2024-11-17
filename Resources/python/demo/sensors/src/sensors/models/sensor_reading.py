from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class SensorReading:
    """Data class representing a sensor reading with all its attributes."""
    sensor_id: str
    temperature: float
    humidity: float
    aqi: int
    noise: float
    latitude: float
    longitude: float
    zone: str
    timestamp: int

    @classmethod
    def create(cls, 
               sensor_id: str,
               temperature: float,
               humidity: float,
               aqi: int,
               noise: float,
               latitude: float,
               longitude: float,
               zone: str,
               timestamp: Optional[int] = None) -> 'SensorReading':
        """Factory method to create a SensorReading instance."""
        if timestamp is None:
            timestamp = int(datetime.now().timestamp() * 1000)
        
        return cls(
            sensor_id=sensor_id,
            temperature=temperature,
            humidity=humidity,
            aqi=aqi,
            noise=noise,
            latitude=latitude,
            longitude=longitude,
            zone=zone,
            timestamp=timestamp
        )