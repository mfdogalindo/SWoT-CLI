package com.exp.semanticmapper.example.mqtt;

import com.exp.semanticmapper.example.service.SemanticMapperService;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

@Component
public class MqttSubscriber {

  private final SemanticMapperService semanticMapperService;

  public MqttSubscriber(SemanticMapperService semanticMapperService) {
    this.semanticMapperService = semanticMapperService;
  }

  @ServiceActivator(inputChannel = "mqttInputChannel")
  public void handleMessage(Message<String> message) {
    String payload = message.getPayload();
    semanticMapperService.mapSensorDataToRDF(payload);
  }
}
