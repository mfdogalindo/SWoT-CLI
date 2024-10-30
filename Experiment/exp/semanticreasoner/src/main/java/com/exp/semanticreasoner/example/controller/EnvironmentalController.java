package com.exp.semanticreasoner.example.controller;

import com.exp.semanticreasoner.example.models.*;
import com.exp.semanticreasoner.example.services.EnvironmentalInferencesServices;
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

    @GetMapping("/observations/temperature")
    public List<TemperatureObservation> getTemperatureAlerts() {
        return service.getTemperatureObservations();
    }

    @GetMapping("/observations/airquality")
    public List<AirQualityObservation> getAirQualityStatus() {
        return service.getAirQualityObservations();
    }

    @GetMapping("/observations/noise")
    public List<NoiseObservation> getHumidityStatus() {
        return service.getNoiseObservations();
    }

    @GetMapping("/observations")
    public List<Observation> getObservations() {
        return service.getObservations();
    }

}
