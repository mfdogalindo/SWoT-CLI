package PackagePlaceHolder.demo.mqtt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import PackagePlaceHolder.demo.model.SensorNodeRecord;
import PackagePlaceHolder.demo.service.SemanticMapperService;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

@Component
public class MqttSubscriber {

  private final SemanticMapperService semanticMapperService;
  private final ObjectMapper jsonMapper;

  public MqttSubscriber(ObjectMapper jsonMapper, SemanticMapperService semanticMapperService) {
    this.jsonMapper = jsonMapper;
    this.semanticMapperService = semanticMapperService;
  }

  @ServiceActivator(inputChannel = "mqttInputChannel")
  public void handleMessage(Message<String> message) throws JsonProcessingException {
    String payload = message.getPayload();
    SensorNodeRecord data = jsonMapper.readValue(payload, SensorNodeRecord.class);
    semanticMapperService.mapSensorDataToRDF(data);
  }
}
