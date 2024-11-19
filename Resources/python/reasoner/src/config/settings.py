import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar variables de entorno desde archivo .env
load_dotenv()


class Settings(BaseSettings):
    # Triple Store Settings
    TRIPLESTORE_URL: str = os.getenv("TRIPLESTORE_URL")
    TRIPLESTORE_DATASET: str = os.getenv("TRIPLESTORE_DATASET", "swot")
    TRIPLESTORE_USERNAME: str = os.getenv("TRIPLESTORE_USERNAME")
    TRIPLESTORE_PASSWORD: str = os.getenv("TRIPLESTORE_PASSWORD")

    # Application Settings
    SWOT_URL_PREFIX: str = os.getenv("SWOT_URL_PREFIX")

    # Rules file
    RULES_FILE: str = os.getenv("RULES_FILE", "rules_turtle.ttl")

    # Scheduler Settings
    SCHEDULER_INTERVAL_SECONDS: int = 60
    SCHEDULER_START_DELAY: int = 30
    MAX_INSTANCES: int = 1
    TIMEZONE: str = "UTC"
    JOB_COALESCE: bool = True
    JOB_MISFIRE_GRACE_TIME: int = 15

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
