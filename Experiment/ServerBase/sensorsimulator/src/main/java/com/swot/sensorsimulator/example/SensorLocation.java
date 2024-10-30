package com.swot.sensorsimulator.example;

public class SensorLocation {
    private final double latitude;
    private final double longitude;
    private final String zone;

    public SensorLocation(double latitude, double longitude, String zone) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.zone = zone;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getZone() {
        return zone;
    }
}
