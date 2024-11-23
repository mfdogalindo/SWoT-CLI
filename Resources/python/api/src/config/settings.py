import logging
import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar variables de entorno desde archivo .env
load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO)
)


class Settings(BaseSettings):
    # Triple Store Settings
    TRIPLESTORE_URL: str = os.getenv("TRIPLESTORE_URL")
    TRIPLESTORE_DATASET: str = os.getenv("TRIPLESTORE_DATASET", "swot")
    TRIPLESTORE_USERNAME: str = os.getenv("TRIPLESTORE_USERNAME")
    TRIPLESTORE_PASSWORD: str = os.getenv("TRIPLESTORE_PASSWORD")

    # Application Settings
    SWOT_URL_PREFIX: str = os.getenv("SWOT_URL_PREFIX")

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna una instancia cacheada de la configuración.
    El decorador lru_cache asegura que solo se crea una instancia.
    """
    return Settings()
