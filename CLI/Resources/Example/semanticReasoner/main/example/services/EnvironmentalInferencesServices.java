package PackagePlaceHolder.example.services;

import PackagePlaceHolder.example.exceptions.TripleStoreQueryException;
import PackagePlaceHolder.example.mappers.EnvironmentalMappers;
import PackagePlaceHolder.example.models.*;
import PackagePlaceHolder.example.repositories.ExampleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QuerySolution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;

@Slf4j
@Service
public class EnvironmentalInferencesServices {

    @Autowired
    private ExampleRepository repository;

    public List<TemperatureAlert> getTemperatureAlerts() {
        return queryToList(EnvironmentalQueries.TEMPERATURE_ALERTS, EnvironmentalMappers.temperatureAlertMapper);
    }

    public List<AirQualityStatus> getAirQualityStatuses() {
        return queryToList(EnvironmentalQueries.AIR_QUALITY_STATUS, EnvironmentalMappers.airQualityStatusMapper);
    }

    public List<ComfortStatus> getComfortLevels() {
        return queryToList(EnvironmentalQueries.COMFORT_STATUS, EnvironmentalMappers.comfortStatusMapper);
    }

    public List<HumidityStatus> getHumidityStatuses() {
        return queryToList(EnvironmentalQueries.HUMIDITY_STATUS, EnvironmentalMappers.humidityStatusMapper);
    }

    public List<Observation> getObservations() {
        return queryToList(EnvironmentalQueries.OBSERVATIONS, EnvironmentalMappers.observationMapper);
    }

    private <T> List<T> queryToList(String query, BiFunction<QuerySolution, LocalDateTime, T> mapper) {
        List<T> list = new ArrayList<>();
        try {
            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(query);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);
                    T item = mapper.apply(soln, timestamp);
                    list.add(item);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query", e);
            throw new TripleStoreQueryException("Failed to retrieve data", e);
        }

        return list;
    }

    /**
     * Parsea una fecha en formato ISO 8601 del triplestore
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // Primero intentamos con el formato completo ISO incluyendo zona horaria
            return Instant.parse(dateTimeStr)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (DateTimeParseException e) {
            try {
                // Si falla, intentamos parsearlo como LocalDateTime
                return LocalDateTime.parse(dateTimeStr);
            } catch (DateTimeParseException e2) {
                log.error("Error parsing datetime: " + dateTimeStr, e2);
                throw new TripleStoreQueryException("Invalid datetime format: " + dateTimeStr, e2);
            }
        }
    }

}