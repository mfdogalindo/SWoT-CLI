import asyncio
import logging
import os

from mqtt.message_handler import MqttMessageHandler
from mqtt.mqtt_client import MqttClient
from services.semantic_mapper_service import SemanticMapperService
from services.triple_store_service import TripleStoreService

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO)
)

logger = logging.getLogger(__name__)


async def main():
    # Initialize services
    logger.info("Initializing services...")
    triple_store = TripleStoreService()
    semantic_mapper = SemanticMapperService(triple_store)
    message_handler = MqttMessageHandler(semantic_mapper)
    mqtt_client = MqttClient(message_handler)

    # Start MQTT client
    mqtt_client.start()

    # Mantén el programa corriendo de forma indefinida
    try:
        while True:
            await asyncio.sleep(3600)  # Mantén el proceso vivo
    except KeyboardInterrupt:
        logger.info("Exiting...")
        mqtt_client.stop()


if __name__ == "__main__":
    asyncio.run(main())
