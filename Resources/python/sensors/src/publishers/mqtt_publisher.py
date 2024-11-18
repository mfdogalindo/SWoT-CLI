import json
import logging
from typing import Any

import paho.mqtt.client as mqtt
from interfaces.message_publisher import MessagePublisher


class MQTTPublisher(MessagePublisher):
    """MQTT implementation of the MessagePublisher interface."""

    def __init__(self, broker: str, client_id: str, port: int = 1883):
        self.broker = broker
        self.client = mqtt.Client(protocol=mqtt.MQTTv31)  # Especificamos la versión del protocolo
        self.logger = logging.getLogger(__name__)
        self.is_connected = False

    def connect(self) -> None:
        """Establish connection to the MQTT broker."""
        try:
            self.client.connect(self.broker, port=1883)
            self.client.loop_start()
            self.is_connected = True
            self.logger.info(f"Connected successfully to MQTT broker: {self.broker}")
        except Exception as e:
            self.logger.error(f"Failed to connect to MQTT broker: {str(e)}")
            raise

    def publish(self, topic: str, message: Any, qos: int = 2) -> None:
        """Publish a message to the specified MQTT topic."""
        if not self.is_connected:
            raise RuntimeError("Not connected to MQTT broker")

        try:
            payload = json.dumps(message.__dict__ if hasattr(message, '__dict__') else message)
            self.client.publish(topic, payload, qos=qos)
            self.logger.debug(f"Published message to {topic}: {payload}")
        except Exception as e:
            self.logger.error(f"Failed to publish message: {str(e)}")
            raise

    def disconnect(self) -> None:
        """Disconnect from the MQTT broker."""
        if self.is_connected:
            try:
                self.client.loop_stop()
                self.client.disconnect()
                self.is_connected = False
                self.logger.info("Disconnected from MQTT broker")
            except Exception as e:
                self.logger.error(f"Error disconnecting from MQTT broker: {str(e)}")
