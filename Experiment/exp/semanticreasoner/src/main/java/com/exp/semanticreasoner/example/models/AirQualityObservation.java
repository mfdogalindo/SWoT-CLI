package com.exp.semanticreasoner.example.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class AirQualityObservation extends Observation  {

    private boolean alert;

    @Builder
    public AirQualityObservation(String observationId, String sensorId, double value, String unit, LocalDateTime time, boolean alert) {
        super(observationId, sensorId, value, unit, time);
        this.alert = alert;
    }

}
