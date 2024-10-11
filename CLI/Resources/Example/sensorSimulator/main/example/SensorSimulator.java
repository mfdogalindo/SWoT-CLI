package PackagePlaceHolder.example;

import org.eclipse.paho.client.mqttv3.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.Random;
import java.util.UUID;


@Component
class SensorSimulator {

    private final MqttClient mqttClient;
    private final Random random = new Random();

    @Value ("${MQTT_TOPIC:sensors/data}")
    private String topic;
    
    public SensorSimulator(@Value("${MQTT_BROKER:tcp://localhost:1883}") String broker) throws MqttException {
        String clientId = "SensorSimulator-" + UUID.randomUUID().toString();
        this.mqttClient = new MqttClient(broker, clientId);
        MqttConnectOptions connOpts = new MqttConnectOptions();
        connOpts.setCleanSession(true);
        System.out.println("Connecting to broker: " + broker);
        this.mqttClient.connect(connOpts);
        System.out.println("Connected");
    }

    @Scheduled(fixedRate = 5000)
    public void simulateSensorData() throws MqttException {
        String topic = "sensors/data";
        String sensorId = "sensor-" + UUID.randomUUID().toString().substring(0, 8);
        double temperature = 20 + (random.nextDouble() * 15); // Temperature between 20 and 35
        double humidity = 30 + (random.nextDouble() * 70);    // Humidity between 30 and 100
        int airQuality = random.nextInt(500);                 // AQI between 0 and 500

        String content = String.format(
            "{\"id\":\"%s\",\"temperature\":%.2f,\"humidity\":%.2f,\"airQuality\":%d}",
            sensorId, temperature, humidity, airQuality
        );

        System.out.println("Publishing message: " + content);
        MqttMessage message = new MqttMessage(content.getBytes());
        message.setQos(2);
        mqttClient.publish(topic, message);
    }
}