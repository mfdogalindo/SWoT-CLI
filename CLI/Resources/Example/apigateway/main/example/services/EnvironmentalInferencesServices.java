package PackagePlaceHolder.example.services;

import PackagePlaceHolder.example.exceptions.TripleStoreQueryException;
import PackagePlaceHolder.example.models.AirQualityStatus;
import PackagePlaceHolder.example.models.ComfortStatus;
import PackagePlaceHolder.example.models.HumidityStatus;
import PackagePlaceHolder.example.models.Observation;
import PackagePlaceHolder.example.models.TemperatureAlert;
import PackagePlaceHolder.example.repositories.EnvironmentalRepository;
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

@Slf4j
@Service
public class EnvironmentalInferencesServices {

    @Autowired
    private EnvironmentalRepository repository;

    public List<TemperatureAlert> getTemperatureAlerts() {
        // Consulta SPARQL para obtener alertas de temperatura
        String queryString = """
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX sosa: <http://www.w3.org/ns/sosa/>
                    PREFIX swot: <http://example.org/swot/property/>
                    PREFIX inference: <http://example.org/swot/inference/>
                    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                
                    SELECT ?observationId ?sensorId ?temperature ?alertLevel ?timestamp
                    WHERE {
                        ?observationId rdf:type sosa:Observation ;
                                      sosa:madeBySensor ?sensorId ;
                                      sosa:observedProperty swot:temperature ;
                                      sosa:hasSimpleResult ?temperature ;
                                      sosa:resultTime ?timestamp ;
                                      inference:temperatureAlert ?alertLevel .
                
                        # Filtrar solo las alertas recientes (últimas 24 horas)
                        FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                    }
                    ORDER BY DESC(?timestamp)
                """;
        List<TemperatureAlert> alerts = new ArrayList<>();

        try {

            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(queryString);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);

                    TemperatureAlert alert = TemperatureAlert.builder()
                            .observationId(soln.getResource("observationId").getURI())
                            .sensorId(soln.getResource("sensorId").getURI())
                            .temperature(soln.getLiteral("temperature").getDouble())
                            .alertLevel(soln.getLiteral("alertLevel").getString())
                            .timestamp(timestamp)
                            .build();
                    alerts.add(alert);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query for temperature alerts", e);
            throw new TripleStoreQueryException("Failed to retrieve temperature alerts", e);
        }

        return alerts;
    }

    public List<AirQualityStatus> getAirQualityStatuses() {
        // Consulta SPARQL para obtener estados de calidad del aire
        String queryString = """
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX sosa: <http://www.w3.org/ns/sosa/>
                    PREFIX swot: <http://example.org/swot/property/>
                    PREFIX inference: <http://example.org/swot/inference/>
                    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                
                    SELECT ?observationId ?sensorId ?airQuality ?status ?timestamp
                    WHERE {
                        ?observationId rdf:type sosa:Observation ;
                                      sosa:madeBySensor ?sensorId ;
                                      sosa:observedProperty swot:airQuality ;
                                      sosa:hasSimpleResult ?airQuality ;
                                      sosa:resultTime ?timestamp ;
                                      inference:airQualityStatus ?status .
                
                        # Filtrar solo los estados recientes (últimas 24 horas)
                        FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                    }
                    ORDER BY DESC(?timestamp)
                """;
        List<AirQualityStatus> statuses = new ArrayList<>();

        try {

            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(queryString);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);

                    AirQualityStatus status = AirQualityStatus.builder()
                            .observationId(soln.getResource("observationId").getURI())
                            .sensorId(soln.getResource("sensorId").getURI())
                            .airQuality(soln.getLiteral("airQuality").getDouble())
                            .status(soln.getLiteral("status").getString())
                            .timestamp(timestamp)
                            .build();
                    statuses.add(status);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query for air quality statuses", e);
            throw new TripleStoreQueryException("Failed to retrieve air quality statuses",
                    e);
        }

        return statuses;
    }

    public List<ComfortStatus> getComfortLevels() {
        // Consulta SPARQL para obtener niveles de confort
        String queryString = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX swot: <http://example.org/swot/property/>
                PREFIX inference: <http://example.org/swot/inference/>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                
                SELECT ?tempObservation ?sensorId ?temperatureValue ?humidityValue ?comfortLevel ?timestamp\s
                WHERE {
                    # Obtener observación de temperatura
                    ?tempObservation rdf:type sosa:Observation ;
                                    sosa:madeBySensor ?sensorId ;
                                    sosa:observedProperty swot:temperature ;
                                    sosa:hasSimpleResult ?temperatureValue ;
                                    sosa:resultTime ?timestamp ;
                  					inference:comfortLevel ?comfortLevel .
                
                    # Obtener observación de humedad para el mismo sensor y timestamp
                    ?humidityObservation rdf:type sosa:Observation ;
                                         sosa:madeBySensor ?sensorId ;
                                         sosa:observedProperty swot:humidity ;
                                         sosa:hasSimpleResult ?humidityValue ;
                                         sosa:resultTime ?timestamp .
                
                    # Filtrar solo las observaciones recientes
                    FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                }
                ORDER BY DESC(?timestamp)
                """;
        List<ComfortStatus> levels = new ArrayList<>();

        try {

            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(queryString);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);

                    ComfortStatus level = ComfortStatus.builder()
                            .observationId(soln.getResource("tempObservation").getURI())
                            .sensorId(soln.getResource("sensorId").getURI())
                            .temperature(soln.getLiteral("temperatureValue").getDouble())
                            .humidity(soln.getLiteral("humidityValue").getDouble())
                            .comfortLevel(soln.getLiteral("comfortLevel").getString())
                            .timestamp(timestamp)
                            .build();
                    levels.add(level);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query for comfort levels",
                    e);
            throw new TripleStoreQueryException("Failed to retrieve comfort levels", e);
        }

        return levels;
    }

    public List<HumidityStatus> getHumidityStatuses() {
        // Consulta SPARQL para obtener estados de humedad
        String queryString = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX swot: <http://example.org/swot/property/>
                PREFIX inference: <http://example.org/swot/inference/>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                
                SELECT ?observationId ?sensorId ?humidity ?status ?timestamp
                WHERE {
                    ?observationId rdf:type sosa:Observation ;
                                  sosa:madeBySensor ?sensorId ;
                                  sosa:observedProperty swot:humidity ;
                                  sosa:hasSimpleResult ?humidity ;
                                  sosa:resultTime ?timestamp ;
                                  inference:humidityLevel ?status .
                
                    # Filtrar solo los estados recientes (últimas 24 horas)
                    FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                }
                ORDER BY DESC(?timestamp)
                """;
        List<HumidityStatus> statuses = new ArrayList<>();

        try {

            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(queryString);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);

                    HumidityStatus status = HumidityStatus.builder()
                            .observationId(soln.getResource("observationId").getURI())
                            .sensorId(soln.getResource("sensorId").getURI())
                            .humidity(soln.getLiteral("humidity").getDouble())
                            .status(soln.getLiteral("status").getString())
                            .timestamp(timestamp)
                            .build();
                    statuses.add(status);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query for humidity statuses", e);
            throw new TripleStoreQueryException("Failed to retrieve humidity statuses", e);
        }

        return statuses;
    }

    public List<Observation> getObservations() {
        // Consulta SPARQL para obtener observaciones
        String queryString = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX swot: <http://example.org/swot/property/>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
           
                SELECT ?id ?sensorId ?timestamp ?observedProperty ?result ?unit
                WHERE {
                    ?id rdf:type sosa:Observation ;
                        sosa:madeBySensor ?sensorId ;
                        sosa:hasUnit ?unit;
                        sosa:observedProperty ?observedProperty ;
                        sosa:hasSimpleResult ?result ;
                        sosa:resultTime ?timestamp .
           
                    # Filtrar solo las observaciones recientes (últimas 24 horas)
                    FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
           
                }
                ORDER BY DESC(?timestamp)
                """;
        List<Observation> observations = new ArrayList<>();

        try {

            // Primero, recolectamos todos los resultados en una lista
            List<QuerySolution> solutions = repository.queryResultSet(queryString);

            // Luego procesamos los resultados
            for (QuerySolution soln : solutions) {
                try {
                    String timestampStr = soln.getLiteral("timestamp").getString();
                    LocalDateTime timestamp = parseDateTime(timestampStr);

                    Observation observation = Observation.builder()
                            .id(soln.getResource("id").getURI())
                            .sensorId(soln.getResource("sensorId").getURI())
                            .timestamp(timestamp)
                            .observedProperty(soln.getResource("observedProperty").getURI())
                            .result(soln.getLiteral("result").getDouble())
                            .unit(soln.getResource("unit") != null ? soln.getResource("unit").getURI() : null)
                            .build();
                    observations.add(observation);
                } catch (Exception e) {
                    log.error("Error processing result row: " + soln, e);
                    // Continuamos con el siguiente resultado en caso de error
                }
            }
        } catch (Exception e) {
            log.error("Error executing SPARQL query for observations", e);
            throw new TripleStoreQueryException("Failed to retrieve observations", e);
        }

        return observations;
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
