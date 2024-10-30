package com.exp.visualization.example.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class TemperatureObservation extends Observation {

    @Builder
    public TemperatureObservation(String observationId, String sensorId, double value, String unit, LocalDateTime time, boolean alert) {
        super(observationId, sensorId, value, unit, time, alert);
    }
}
