package PackagePlaceHolder.example.services;

import PackagePlaceHolder.example.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class DataService {

   @Value("${API_GATEWAY_URL}")
   private String apiGatewayUrl;

   @Autowired
   RestTemplate restTemplate;

   private List<TemperatureAlert> getTemperatureAlerts() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/temperature/alerts", List.class);
   }

   private List<AirQualityStatus> getAirQualityStatus() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/airquality/status", List.class);
   }

   private List<HumidityStatus> getHumidityStatus() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/humidity/status", List.class);
   }

   private List<ComfortStatus> getComfortLevels() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/comfort/levels", List.class);
   }


   public DashboardResponse getDashboardData() {
      List<TemperatureAlert> temperatureAlerts = getTemperatureAlerts();
      List<AirQualityStatus> airQualityStatus = getAirQualityStatus();
      List<HumidityStatus> humidityStatus = getHumidityStatus();
      List<ComfortStatus> comfortLevels = getComfortLevels();

      return DashboardResponse.builder()
            .temperatureAlerts(temperatureAlerts)
            .airQualityStatuses(airQualityStatus)
            .humidityStatus(humidityStatus)
            .comfortLevels(comfortLevels)
            .build();

   }
}

