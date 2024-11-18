import json
import logging
from typing import Union, Dict, Any

from models.sensor_data import SensorNodeRecord
from services.semantic_mapper_service import SemanticMapperService


class MqttMessageHandler:
    def __init__(self, semantic_mapper_service: SemanticMapperService):
        self.semantic_mapper_service = semantic_mapper_service
        self.logger = logging.getLogger(__name__)

    def handle_message(self, message: Union[bytes, str, Dict[str, Any], SensorNodeRecord]) -> None:
        """
        Procesa los mensajes MQTT recibidos.
        Args:
            message: Puede ser bytes, string, diccionario o SensorNodeRecord
        """
        try:
            # Si ya es una instancia de SensorNodeRecord, usarla directamente
            if isinstance(message, SensorNodeRecord):
                data = message
            else:
                # Convertir el mensaje a diccionario si es necesario
                if isinstance(message, bytes):
                    payload = json.loads(message.decode('utf-8'))
                elif isinstance(message, str):
                    payload = json.loads(message)
                elif isinstance(message, dict):
                    payload = message
                else:
                    self.logger.error(f"Unsupported message type: {type(message)}")
                    return

                # Crear instancia de SensorNodeRecord
                data = SensorNodeRecord(**payload)

            self.logger.info(f"Processing data from sensor: {data.id}")

            # Mapear los datos a RDF
            self.semantic_mapper_service.map_sensor_data_to_rdf(data)

        except json.JSONDecodeError as e:
            self.logger.error(f"Invalid JSON in MQTT message: {e}")
        except Exception as e:
            self.logger.error(f"Error processing MQTT message: {e}", exc_info=True)
            self.logger.debug(f"Message that caused error: {message}")
