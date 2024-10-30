package com.exp.visualization.example.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class NoiseObservation extends Observation {

    @Builder
    public NoiseObservation(String observationId, String sensorId, double value, String unit, LocalDateTime time, boolean alert) {
        super(observationId, sensorId, value, unit, time, alert);
    }

}
