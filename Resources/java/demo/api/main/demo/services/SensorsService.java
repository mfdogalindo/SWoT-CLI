package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.exceptions.ResourceNotFoundException;
import PackagePlaceHolder.demo.models.Page;
import PackagePlaceHolder.demo.models.PageRequest;
import PackagePlaceHolder.demo.models.SensorDetail;
import PackagePlaceHolder.demo.repositories.ExampleRepository;
import PackagePlaceHolder.demo.utils.DateTimeUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QuerySolution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import static PackagePlaceHolder.demo.services.SparqlQueries.SENSOR_DETAILS_QUERY;

@Slf4j
@Service
public class SensorsService {

    @Autowired
    private ExampleRepository repository;

    @Value("${SWOT_URL_PREFIX}")
    private String appUrlPrefix;

    public SensorDetail getSensorById(String sensorId) {
        String filter = String.format("FILTER(?id = \"%s\")", sensorId);
        String queryString = SENSOR_DETAILS_QUERY.formatted(appUrlPrefix, filter, "");

        List<QuerySolution> solutions = repository.queryResultSet(queryString);

        if (!solutions.isEmpty()) {
            return buildSensorDetail(solutions.getFirst());
        }

        throw new ResourceNotFoundException("Sensor not found with id: " + sensorId);
    }

    public Page<SensorDetail> getAllSensors(PageRequest pageRequest) {
        // Consulta para contar el total de sensores
        String countQuery = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                SELECT (COUNT(DISTINCT ?sensor) as ?count)
                WHERE {
                    ?sensor rdf:type sosa:Sensor .
                }
                """;

        List<QuerySolution> countSolutions = repository.queryResultSet(countQuery);
        long totalElements = countSolutions.isEmpty() ? 0 :
                countSolutions.getFirst().getLiteral("count").getLong();

        // Consulta para obtener los detalles paginados
        String pagination = String.format("ORDER BY ?id OFFSET %d LIMIT %d",
                pageRequest.getOffset(), pageRequest.getSize());

        String queryString = SENSOR_DETAILS_QUERY.formatted(appUrlPrefix, "", pagination);

        List<SensorDetail> sensors = new ArrayList<>();
        List<QuerySolution> solutions = repository.queryResultSet(queryString);

        for (QuerySolution solution : solutions) {
            sensors.add(buildSensorDetail(solution));
        }

        return Page.of(sensors, pageRequest, totalElements);
    }

    private SensorDetail buildSensorDetail(QuerySolution solution) {
        return SensorDetail.builder()
                .id(solution.getLiteral("id").getString())
                .zone(solution.contains("zone") ?
                        solution.getLiteral("zone").getString() : null)
                .latitude(solution.contains("lat") ?
                        solution.getLiteral("lat").getDouble() : null)
                .longitude(solution.contains("long") ?
                        solution.getLiteral("long").getDouble() : null)
                .totalObservations(solution.getLiteral("totalObs").getInt())
                .totalAlerts(solution.getLiteral("totalAlerts").getInt())
                .lastReading(DateTimeUtils.parseDateTime(solution.getLiteral("lastReading").getString()))
                .build();
    }

    // Method auxiliar para manejo seguro de valores nulos en QuerySolution
    private <T> T getOptionalValue(QuerySolution solution, String variable,
                                   Function<QuerySolution, T> extractor) {
        if (solution.contains(variable)) {
            try {
                return extractor.apply(solution);
            } catch (Exception e) {
                log.warn("Error extracting value for {}: {}", variable, e.getMessage());
                return null;
            }
        }
        return null;
    }
}
