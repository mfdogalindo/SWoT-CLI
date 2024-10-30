package com.exp.semanticmapper.example.models;

import lombok.Data;
import org.apache.jena.rdf.model.Resource;

@Data
public class SensorLocation {
    private final double latitude;
    private final double longitude;
    private final String zone;
    private final Resource locationResource;
}
