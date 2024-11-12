package PackagePlaceHolder.demo.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class MqttConfig {

    @Value("${MQTT_BROKER:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${MQTT_TOPIC:sensors/data}")
    private String topic;

    @Value("${MQTT_CLIENT:semantic-mapper}")
    private String clientId;

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
        ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();
        threadPoolTaskScheduler.setPoolSize(1);
        threadPoolTaskScheduler.setThreadNamePrefix("MqttReconnect");
        return threadPoolTaskScheduler;
    }

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        System.out.println("Broker URL: " + brokerUrl);
        options.setServerURIs(new String[] { brokerUrl });
        options.setCleanSession(true);

        // Configurar opciones de reconexión automática
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(30);
        options.setKeepAliveInterval(60);
        options.setMaxInflight(10);
        // Configurar intervalo de reintentos
        options.setMaxReconnectDelay(60000); // 60 segundos máximo entre reintentos

        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttInbound(MqttPahoClientFactory mqttClientFactory,
                                                           ThreadPoolTaskScheduler taskScheduler) {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(clientId + "_" + System.currentTimeMillis(),
                        mqttClientFactory,
                        topic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannelName("mqttInputChannel");
        adapter.setTaskScheduler(taskScheduler);

        return adapter;
    }
}