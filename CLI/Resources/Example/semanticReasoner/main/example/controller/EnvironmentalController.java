package PackagePlaceHolder.example.controller;

import PackagePlaceHolder.example.models.*;
import PackagePlaceHolder.example.services.EnvironmentalInferencesServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class EnvironmentalController {

    @Autowired
    private EnvironmentalInferencesServices service;

    @GetMapping("/temperature/alerts")
    public List<TemperatureAlert> getTemperatureAlerts() {
        return service.getTemperatureAlerts();
    }

    @GetMapping("/airquality/status")
    public List<AirQualityStatus> getAirQualityStatus() {
        return service.getAirQualityStatuses();
    }

    @GetMapping("/humidity/status")
    public List<HumidityStatus> getHumidityStatus() {
        return service.getHumidityStatuses();
    }

    @GetMapping("/comfort/levels")
    public List<ComfortStatus> getComfortLevels() {
        return service.getComfortLevels();
    }

    @GetMapping("/observations")
    public List<Observation> getObservations() {
        return service.getObservations();
    }

}
