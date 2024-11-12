package PackagePlaceHolder.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;


@Slf4j
@Component
class SensorSimulator {

    private final MqttClient mqttClient;
    private final Random random = new Random();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, SensorLocation> sensorLocations;

    @Value("${MQTT_TOPIC}")
    private String topic;

    public SensorSimulator(@Value("${MQTT_BROKER}") String broker) throws MqttException {
        String clientId = "SmartCitySimulator-" + System.currentTimeMillis();
        this.mqttClient = new MqttClient(broker, clientId);
        this.sensorLocations = initializeSensorLocations();

        MqttConnectOptions connOpts = new MqttConnectOptions();
        connOpts.setCleanSession(true);
        connOpts.setAutomaticReconnect(true);

        log.info("Connecting to broker: {}", broker);
        this.mqttClient.connect(connOpts);
        log.info("Connected successfully to MQTT broker");
    }

    private Map<String, SensorLocation> initializeSensorLocations() {
        Map<String, SensorLocation> locations = new HashMap<>();
        // Agregamos 10 sensores fijos distribuidos en diferentes zonas
        locations.put("NODE-001", new SensorLocation(2.4422, -76.6122, "ZONE-NORTH"));
        locations.put("NODE-002", new SensorLocation(2.4431, -76.6131, "ZONE-NORTH"));
        locations.put("NODE-003", new SensorLocation(2.4440, -76.6140, "ZONE-SOUTH"));
        locations.put("NODE-004", new SensorLocation(2.4449, -76.6149, "ZONE-SOUTH"));
        locations.put("NODE-005", new SensorLocation(2.4458, -76.6158, "ZONE-EAST"));
        locations.put("NODE-006", new SensorLocation(2.4467, -76.6167, "ZONE-EAST"));
        locations.put("NODE-007", new SensorLocation(2.4476, -76.6176, "ZONE-WEST"));
        locations.put("NODE-008", new SensorLocation(2.4485, -76.6185, "ZONE-WEST"));
        locations.put("NODE-009", new SensorLocation(2.4494, -76.6194, "ZONE-CENTRAL"));
        locations.put("NODE-010", new SensorLocation(2.4503, -76.6203, "ZONE-CENTRAL"));
        return locations;
    }

    @Scheduled(fixedRate = 60000) // Cada minuto
    public void simulateSensorData() {
        try {
            for (Map.Entry<String, SensorLocation> sensor : sensorLocations.entrySet()) {
                String sensorId = sensor.getKey();
                SensorLocation location = sensor.getValue();

                // Generate random sensor data
                double temperature = 15 + (random.nextDouble() * 25); //  15°C - 40°C
                double humidity = 30 + (random.nextDouble() * 70); //  30% - 100%
                int aqi = 50 + random.nextInt(300); //  50 - 350 AQI
                double noise = 30 + (random.nextDouble() * 70); //  30 dB - 100 dB

                SensorReading reading = new SensorReading(
                        sensorId,
                        temperature,
                        humidity,
                        aqi,
                        noise,
                        location.getLatitude(),
                        location.getLongitude(),
                        location.getZone(),
                        System.currentTimeMillis()
                );

                String payload = objectMapper.writeValueAsString(reading);
                MqttMessage message = new MqttMessage(payload.getBytes());
                message.setQos(2);

                mqttClient.publish(topic, message);

                log.info("Published data for sensor {}: {}", sensorId, payload);

            }
        } catch (Exception e) {
            log.error("Error publishing sensor data", e);
        }
    }

    @PostConstruct
    public void startSimulation() {
        log.info("Sensor simulator initialized with {} sensors", sensorLocations.size());
        simulateSensorData();
    }
}