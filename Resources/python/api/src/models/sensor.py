from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import Field, BaseModel

from models.api import SensorType


class SensorDetail(BaseModel):
    id: str = Field(..., description="Identificador único del sensor")
    zone: Optional[str] = Field(None, description="Zona donde está ubicado el sensor")
    latitude: Optional[float] = Field(None, description="Latitud de la ubicación del sensor")
    longitude: Optional[float] = Field(None, description="Longitud de la ubicación del sensor")
    total_observations: int = Field(..., description="Total de observaciones registradas")
    total_alerts: int = Field(..., description="Total de alertas generadas")
    last_reading: Optional[datetime] = Field(None, description="Timestamp de la última lectura")

    class Config:
        from_attributes = True  # Para permitir la conversión desde objetos SQLAlchemy/dataclass
        json_schema_extra = {
            "example": {
                "id": "sensor123",
                "zone": "Zone A",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "total_observations": 150,
                "total_alerts": 5,
                "last_reading": "2024-11-21T10:30:00"
            }
        }


class SensorReading(BaseModel):
    sensor_id: str = Field(..., description="ID del sensor")
    value: float = Field(..., description="Valor de la lectura")
    unit: str = Field(..., description="Unidad de medida")
    timestamp: datetime = Field(..., description="Timestamp de la lectura")
    processed: bool = Field(..., description="Indica si la lectura ha sido procesada")


class SensorReadingAlert(BaseModel):
    sensor_id: str = Field(..., description="ID del sensor")
    value: float = Field(..., description="Valor que generó la alerta")
    unit: str = Field(..., description="Unidad de medida")
    timestamp: datetime = Field(..., description="Timestamp de la alerta")
    alert_type: str = Field(..., description="Tipo de alerta")
    severity: str = Field(..., description="Severidad de la alerta")
    message: str = Field(..., description="Mensaje descriptivo de la alerta")


class SensorTyped(Enum):
    TEMPERATURE = ("temperature", "Temperature", "°C")
    HUMIDITY = ("humidity", "Humidity", "%")
    NOISE = ("noise", "NoiseLevel", "dB")
    AIR_QUALITY = ("air-quality", "AirQuality", "AQI")

    def __init__(self, endpoint: str, observation_name: str, unit: str):
        self.endpoint = endpoint
        self.observation_name = observation_name
        self.default_unit = unit

    @classmethod
    def from_sensor_type(cls, stype: SensorType) -> 'SensorTyped':
        for sensor_type in cls:
            if sensor_type.endpoint == stype.value:
                return sensor_type
        raise ValueError(f"Invalid sensor type endpoint: {stype}")
