package com.exp.visualization.example.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class Observation {
    private String observationId;
    private String sensorId;
    private double value;
    private String unit;
    private LocalDateTime time;
    private boolean alert;
}
