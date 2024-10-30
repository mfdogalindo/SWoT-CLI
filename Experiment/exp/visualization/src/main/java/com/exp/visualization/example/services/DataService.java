package com.exp.visualization.example.services;

import com.exp.visualization.example.models.*;
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

   private List<TemperatureObservation> getTemperature() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/observations/temperature", List.class);
   }

   private List<AirQualityObservation> getAirQuality() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/observations/airquality", List.class);
   }

   private List<NoiseObservation> getNoise() {
      return restTemplate.getForObject(apiGatewayUrl + "/api/v1/reasoner/observations/noise", List.class);
   }

   public DashboardResponse getDashboardData() {
      List<TemperatureObservation> temperature = getTemperature();
      List<AirQualityObservation> airQuality = getAirQuality();
      List<NoiseObservation> noise = getNoise();

      return DashboardResponse.builder()
            .temperatureObservations(temperature)
            .airQualityObservations(airQuality)
            .noiseObservations(noise)
            .build();

   }
}

