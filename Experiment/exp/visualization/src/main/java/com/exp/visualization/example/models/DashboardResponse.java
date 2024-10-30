package com.exp.visualization.example.models;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {
    List<AirQualityObservation> airQualityObservations;
    List<NoiseObservation> noiseObservations;
    List<TemperatureObservation> temperatureObservations;
}
