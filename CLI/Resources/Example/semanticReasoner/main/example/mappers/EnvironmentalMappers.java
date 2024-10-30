package PackagePlaceHolder.example.mappers;

import PackagePlaceHolder.example.models.*;
import org.apache.jena.query.QuerySolution;

import java.time.LocalDateTime;
import java.util.function.BiFunction;

public class EnvironmentalMappers {

    final static public BiFunction<QuerySolution, LocalDateTime, TemperatureAlert> temperatureAlertMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return TemperatureAlert.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .temperature(soln.getLiteral("temperature").getDouble())
                .alertLevel(soln.getLiteral("alertLevel").getString())
                .timestamp(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, AirQualityStatus> airQualityStatusMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return AirQualityStatus.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .airQuality(soln.getLiteral("airQuality").getDouble())
                .status(soln.getLiteral("status").getString())
                .timestamp(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, ComfortStatus> comfortStatusMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return ComfortStatus.builder()
                .observationId(soln.getResource("tempObservation").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .temperature(soln.getLiteral("temperatureValue").getDouble())
                .humidity(soln.getLiteral("humidityValue").getDouble())
                .comfortLevel(soln.getLiteral("comfortLevel").getString())
                .timestamp(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, HumidityStatus> humidityStatusMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return HumidityStatus.builder()
                .observationId(soln.getResource("observationId").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .humidity(soln.getLiteral("humidity").getDouble())
                .status(soln.getLiteral("status").getString())
                .timestamp(timestamp)
                .build();
    };

    final static public BiFunction<QuerySolution, LocalDateTime, Observation> observationMapper = (QuerySolution soln, LocalDateTime timestamp) -> {
        return Observation.builder()
                .id(soln.getResource("id").getURI())
                .sensorId(soln.getResource("sensorId").getURI())
                .timestamp(timestamp)
                .observedProperty(soln.getResource("observedProperty").getURI())
                .result(soln.getLiteral("result").getDouble())
                .unit(soln.getResource("unit") != null ? soln.getResource("unit").getURI() : null)
                .build();
    };

}