package com.swot.visualization.example.services;

import com.swot.visualization.example.models.DashboardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DataService {

   @Value("${API_GATEWAY_URL}")
   private String apiGatewayUrl;

   @Autowired
   RestTemplate restTemplate;


   public DashboardResponse getDashboardData() {
      return restTemplate.getForObject(apiGatewayUrl + "/dashboard", DashboardResponse.class);
   }
}

