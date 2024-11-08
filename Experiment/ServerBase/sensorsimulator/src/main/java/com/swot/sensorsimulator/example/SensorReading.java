package com.swot.sensorsimulator.example;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SensorReading {
    @JsonProperty("id")
    private String nodeId;
    private double temperature;
    private double humidity;
    @JsonProperty("airQuality")
    private int aqi;
    @JsonProperty("noiseLevel")
    private double noise;
    private double latitude;
    private double longitude;
    private String zone;
    private long timestamp;

    // Constructor
    public SensorReading(String nodeId, double temperature, double humidity,
                         int aqi, double noise, double latitude, double longitude,
                         String zone, long timestamp) {
        this.nodeId = nodeId;
        this.temperature = temperature;
        this.humidity = humidity;
        this.aqi = aqi;
        this.noise = noise;
        this.latitude = latitude;
        this.longitude = longitude;
        this.zone = zone;
        this.timestamp = timestamp;
    }


}
