import json
import logging
from typing import Protocol

import paho.mqtt.client as mqtt
from config.settings import get_settings
from models.sensor_data import SensorNodeRecord


class MqttHandlerProtocol(Protocol):
    def handle_message(self, data: SensorNodeRecord) -> None:
        ...


class MqttClient:
    def __init__(self, message_handler: MqttHandlerProtocol):
        self._settings = get_settings()
        self._message_handler = message_handler
        self._client = mqtt.Client(self._settings.MQTT_CLIENT)
        self._setup_client()
        self.logger = logging.getLogger(__name__)
        self.logger.info("MQTT client initialized")

    def _setup_client(self) -> None:
        """Configure MQTT client callbacks and connection options."""
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message
        self._client.on_disconnect = self._on_disconnect

        # Set connection options
        self._client.connect_async(
            self._settings.MQTT_HOST,
            port=self._settings.MQTT_PORT,
            keepalive=60
        )

    def _on_connect(self, client: mqtt.Client, userdata, flags, rc: int) -> None:
        """Callback for when client connects to broker."""
        if rc == 0:
            client.subscribe(self._settings.MQTT_TOPIC)
        else:
            self.logger.error(f"Failed to connect to MQTT broker with code: {rc}")

    def _on_message(self, client: mqtt.Client, userdata, msg: mqtt.MQTTMessage) -> None:
        """Callback for when a message is received."""
        try:
            payload = json.loads(msg.payload)
            sensor_data = SensorNodeRecord(**payload)
            self._message_handler.handle_message(sensor_data)
        except Exception as e:
            self.logger.error(f"Error processing MQTT message: {str(e)}")

    def _on_disconnect(self, client: mqtt.Client, userdata, rc: int) -> None:
        """Callback for when client disconnects from broker."""
        if rc != 0:
            self.logger.error(f"Unexpected disconnection from MQTT broker with code: {rc}")
            client.reconnect()

    def start(self) -> None:
        """Start MQTT client loop."""
        self.logger.info("Starting MQTT client loop")
        self._client.loop_start()

    def stop(self) -> None:
        """Stop MQTT client loop."""
        self.logger.info("Stopping MQTT client loop")
        self._client.loop_stop()
        self._client.disconnect()
