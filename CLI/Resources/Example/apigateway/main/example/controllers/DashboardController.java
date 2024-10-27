package PackagePlaceHolder.example.controllers;

import PackagePlaceHolder.example.models.AirQualityStatus;
import PackagePlaceHolder.example.models.ComfortStatus;
import PackagePlaceHolder.example.models.HumidityStatus;
import PackagePlaceHolder.example.models.DashboardResponse;
import PackagePlaceHolder.example.models.TemperatureAlert;
import PackagePlaceHolder.example.services.EnvironmentalInferencesServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private EnvironmentalInferencesServices service;

    @GetMapping()
    public DashboardResponse getDashboard() {
        List<TemperatureAlert> temperatureAlerts = service.getTemperatureAlerts();
        List<AirQualityStatus> airQualityStatuses = service.getAirQualityStatuses();
        List<ComfortStatus> comfortLevels = service.getComfortLevels();
        List<HumidityStatus> humidityStatus = service.getHumidityStatuses();

        return DashboardResponse.builder()
            .temperatureAlerts(temperatureAlerts)
            .airQualityStatuses(airQualityStatuses)
            .comfortLevels(comfortLevels)
            .humidityStatus(humidityStatus)
            .build();
    }

}
