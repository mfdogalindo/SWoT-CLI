package com.swot.sensorsimulator.example;

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
        locations.put("SENSOR-001", new SensorLocation(2.4422, -76.6122, "ZONE-NORTH"));
        locations.put("SENSOR-002", new SensorLocation(2.4431, -76.6131, "ZONE-NORTH"));
        locations.put("SENSOR-003", new SensorLocation(2.4440, -76.6140, "ZONE-SOUTH"));
        locations.put("SENSOR-004", new SensorLocation(2.4449, -76.6149, "ZONE-SOUTH"));
        locations.put("SENSOR-005", new SensorLocation(2.4458, -76.6158, "ZONE-EAST"));
        locations.put("SENSOR-006", new SensorLocation(2.4467, -76.6167, "ZONE-EAST"));
        locations.put("SENSOR-007", new SensorLocation(2.4476, -76.6176, "ZONE-WEST"));
        locations.put("SENSOR-008", new SensorLocation(2.4485, -76.6185, "ZONE-WEST"));
        locations.put("SENSOR-009", new SensorLocation(2.4494, -76.6194, "ZONE-CENTRAL"));
        locations.put("SENSOR-010", new SensorLocation(2.4503, -76.6203, "ZONE-CENTRAL"));
        return locations;
    }

    @Scheduled(fixedRate = 10000) // Cada 10 segundos
    public void simulateSensorData() {
        try {
            for (Map.Entry<String, SensorLocation> sensor : sensorLocations.entrySet()) {
                String sensorId = sensor.getKey();
                SensorLocation location = sensor.getValue();

                // Generar lecturas aleatorias dentro de los rangos especificados
                double temperature = 15 + (random.nextDouble() * 25); // Entre 15°C y 40°C
                double humidity = 30 + (random.nextDouble() * 70); // Entre 30% y 100%
                int aqi = random.nextInt(300); // Entre 0 y 300 AQI
                double noise = 30 + (random.nextDouble() * 70); // Entre 30 dB y 100 dB

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

                // Generar alertas si se superan los umbrales
                if (temperature > 35 || temperature < 0) {
                    log.warn("Temperature alert for sensor {}: {}", sensorId, temperature);
                }
                if (aqi > 150) {
                    log.warn("Air quality alert for sensor {}: {}", sensorId, aqi);
                }
                if (noise > 85) {
                    log.warn("Noise level alert for sensor {}: {}", sensorId, noise);
                }
            }
        } catch (Exception e) {
            log.error("Error publishing sensor data", e);
        }
    }

    @PostConstruct
    public void startSimulation() {
        log.info("Sensor simulator initialized with {} sensors", sensorLocations.size());
        simulateSensorData(); // Primera ejecución inmediata
    }
}