from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class SensorType(Enum):
    TEMPERATURE = ("temperature", "Temperature", "°C")
    HUMIDITY = ("humidity", "Humidity", "%")
    NOISE = ("noise", "Noise Level", "dB")
    AIR_QUALITY = ("air-quality", "Air Quality", "AQI")

    def __init__(self, endpoint: str, display_name: str, unit: str):
        self.endpoint = endpoint
        self.display_name = display_name
        self.default_unit = unit

@dataclass
class SensorReading:
    sensor_id: str
    value: float
    unit: str
    timestamp: datetime
    processed: bool

@dataclass
class SensorReadingAlert:
    sensor_id: str
    value: float
    unit: str
    timestamp: datetime
    alert_type: str
    severity: str
    message: str

@dataclass
class SensorDetail:
    id: str
    zone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    total_observations: int
    total_alerts: int
    last_reading: Optional[datetime]

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }