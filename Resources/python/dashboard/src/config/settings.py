import logging
import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar variables de entorno desde archivo .env
load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO)
)


class Settings(BaseSettings):
    API_URL: str = os.getenv("API_URL", "http://localhost:8081")

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
