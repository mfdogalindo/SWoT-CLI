from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class SensorReading:
    """Data class representing a sensor reading with all its attributes."""
    id: str
    temperature: float
    humidity: float
    airQuality: int
    noiseLevel: float
    latitude: float
    longitude: float
    zone: str
    timestamp: int

    @classmethod
    def create(cls,
               id: str,
               temperature: float,
               humidity: float,
               airQuality: int,
               noiseLevel: float,
               latitude: float,
               longitude: float,
               zone: str,
               timestamp: Optional[int] = None) -> 'SensorReading':
        """Factory method to create a SensorReading instance."""
        if timestamp is None:
            timestamp = int(datetime.now().timestamp() * 1000)

        return cls(
            id=id,
            temperature=temperature,
            humidity=humidity,
            airQuality=airQuality,
            noiseLevel=noiseLevel,
            latitude=latitude,
            longitude=longitude,
            zone=zone,
            timestamp=timestamp
        )
