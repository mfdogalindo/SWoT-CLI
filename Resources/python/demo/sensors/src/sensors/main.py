import os
import time
import logging
from sensors.services.sensor_simulator import SensorSimulator
from sensors.services.sensor_data_generator import SensorDataGenerator
from sensors.publishers.mqtt_publisher import MQTTPublisher

def main():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    # Configuration from environment variables
    mqtt_broker = os.getenv('MQTT_BROKER', 'localhost')
    mqtt_port = os.getenv('MQTT_PORT', '1883')
    mqtt_topic = os.getenv('MQTT_TOPIC', 'sensors_swot')
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