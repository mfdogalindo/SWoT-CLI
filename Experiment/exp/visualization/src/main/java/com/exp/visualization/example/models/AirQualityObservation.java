package com.exp.visualization.example.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class AirQualityObservation extends Observation  {

    @Builder
    public AirQualityObservation(String observationId, String sensorId, double value, String unit, LocalDateTime time, boolean alert) {
        super(observationId, sensorId, value, unit, time, alert);
    }

}
