import os
from functools import lru_cache
from urllib.parse import urlparse

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar variables de entorno desde archivo .env
load_dotenv()


class Settings(BaseSettings):
    """
    Configuración de la aplicación usando Pydantic BaseSettings.
    Carga automáticamente valores desde variables de entorno o .env
    """
    # MQTT Settings
    MQTT_BROKER: str = os.getenv("MQTT_BROKER")  # "tcp://localhost:1883"
    MQTT_TOPIC: str = os.getenv("MQTT_TOPIC")
    MQTT_CLIENT: str = os.getenv("MQTT_CLIENT")

    # Triple Store Settings
    TRIPLESTORE_URL: str = os.getenv("TRIPLESTORE_URL")
    TRIPLESTORE_DATASET: str = os.getenv("TRIPLESTORE_DATASET", "swot")
    TRIPLESTORE_USERNAME: str = os.getenv("TRIPLESTORE_USERNAME")
    TRIPLESTORE_PASSWORD: str = os.getenv("TRIPLESTORE_PASSWORD")

    # Application Settings
    SWOT_URL_PREFIX: str = os.getenv("SWOT_URL_PREFIX")
    APP_PORT: int = int(os.getenv("APP_PORT", "8084"))

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @property
    def MQTT_HOST(self) -> str:
        """Obtener el host del broker MQTT."""
        parsed_broker = urlparse(self.MQTT_BROKER)
        return parsed_broker.hostname

    @property
    def MQTT_PORT(self) -> int:
        """Obtener el puerto del broker MQTT."""
        parsed_broker = urlparse(self.MQTT_BROKER)
        return parsed_broker.port


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna una instancia cacheada de la configuración.
    El decorador lru_cache asegura que solo se crea una instancia.
    """
    return Settings()
