package com.exp.semanticreasoner.example.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class TemperatureObservation extends Observation {

    private boolean lowTemperatureAlert;
    private boolean highTemperatureAlert;

    @Builder
    public TemperatureObservation(String observationId, String sensorId, double value, String unit, LocalDateTime time, boolean lowTemperatureAlert, boolean highTemperatureAlert) {
        super(observationId, sensorId, value, unit, time);
        this.lowTemperatureAlert = lowTemperatureAlert;
        this.highTemperatureAlert = highTemperatureAlert;
    }
}
