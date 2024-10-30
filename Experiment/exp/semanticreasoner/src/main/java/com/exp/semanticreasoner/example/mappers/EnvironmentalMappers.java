package com.exp.semanticreasoner.example.mappers;

import com.exp.semanticreasoner.example.models.*;
import org.apache.jena.query.QuerySolution;

import java.time.LocalDateTime;
import java.util.function.BiFunction;

public class EnvironmentalMappers {

    final static public BiFunction<QuerySolution, LocalDateTime, TemperatureObservation> temperatureObservation = (QuerySolution soln, LocalDateTime timestamp) -> {
        return TemperatureObservation.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .value(soln.getLiteral("value").getDouble())
                .highTemperatureAlert(soln.getLiteral("htAlert") != null && soln.getLiteral("htAlert").getBoolean())
                .lowTemperatureAlert(soln.getLiteral("ltAlert") != null && soln.getLiteral("ltAlert").getBoolean())
                .unit(soln.getResource("unit").getURI())
                .time(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, AirQualityObservation> airQualityObservation = (QuerySolution soln, LocalDateTime timestamp) -> {
        return AirQualityObservation.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .value(soln.getLiteral("value").getDouble())
                .alert(soln.getLiteral("alert") != null && soln.getLiteral("alert").getBoolean())
                .unit(soln.getResource("unit").getURI())
                .time(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, NoiseObservation> noiseAlertObservation = (QuerySolution soln, LocalDateTime timestamp) -> {
        return NoiseObservation.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .value(soln.getLiteral("value").getDouble())
                .alert(soln.getLiteral("alert") != null && soln.getLiteral("alert").getBoolean())
                .unit(soln.getResource("unit").getURI())
                .time(timestamp)
                .build();
    };


    final static public BiFunction<QuerySolution, LocalDateTime, Observation> observationMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return new Observation(
                soln.getResource("observationId").getURI(),
                soln.getResource("sensorId").getURI(),
                soln.getLiteral("value").getDouble(),
                soln.getResource("unit").getURI(),
                timestamp
                );

    };

}