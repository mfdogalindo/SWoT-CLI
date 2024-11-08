package PackagePlaceHolder.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.messaging.MessageChannel;

@Configuration
public class MqttChannelConfig {

  @Bean
  public MessageChannel mqttInputChannel() {
    return new DirectChannel();
  }
}
