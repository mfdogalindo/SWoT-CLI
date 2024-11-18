import logging
import os
import time
from urllib.parse import urlparse

from publishers.mqtt_publisher import MQTTPublisher
from services.sensor_data_generator import SensorDataGenerator
from services.sensor_simulator import SensorSimulator


def main():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)

    # Configuration from environment variables
    parsed_broker = urlparse(os.getenv('MQTT_BROKER'))
    mqtt_broker = parsed_broker.hostname
    mqtt_port = parsed_broker.port
    mqtt_topic = os.getenv('MQTT_TOPIC')
    simulation_interval = int(os.getenv('SIMULATION_INTERVAL', '60'))

    publisher = None

    try:
        # Initialize components
        publisher = MQTTPublisher(
            broker=mqtt_broker,
            port=int(mqtt_port),
            client_id=f"SmartCitySimulator-{int(time.time())}"
        )
        publisher.connect()

        data_generator = SensorDataGenerator()
        simulator = SensorSimulator(publisher, data_generator, mqtt_topic)

        logger.info(f"Starting sensor simulation with {len(simulator.sensor_locations)} sensors")

        # Main simulation loop
        while True:
            simulator.simulate_readings()
            time.sleep(simulation_interval)

    except KeyboardInterrupt:
        logger.info("Simulation stopped by user")
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        raise
    finally:
        if publisher is not None:
            try:
                publisher.disconnect()
            except Exception as e:
                logger.error(f"Error during disconnect: {str(e)}")


if __name__ == "__main__":
    main()
