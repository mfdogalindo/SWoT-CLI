from pydantic import BaseModel, Field


class SensorNodeRecord(BaseModel):
    """
    Modelo de datos para registros de sensores.
    Ajustado para coincidir con el formato de mensaje exacto.
    """
    id: str
    temperature: float
    humidity: float
    air_quality: int = Field(..., alias='airQuality')
    noise_level: float = Field(..., alias='noiseLevel')
    latitude: float
    longitude: float
    zone: str
    timestamp: int

    class Config:
        populate_by_name = True
        extra = "allow"

    @property
    def sensor_id(self) -> str:
        return self.id
