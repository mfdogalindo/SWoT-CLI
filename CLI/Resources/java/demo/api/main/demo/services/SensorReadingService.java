package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.enums.SensorType;
import PackagePlaceHolder.demo.models.Page;
import PackagePlaceHolder.demo.models.PageRequest;
import PackagePlaceHolder.demo.models.SensorReading;
import PackagePlaceHolder.demo.repositories.ExampleRepository;
import PackagePlaceHolder.demo.utils.DateTimeUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QuerySolution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static PackagePlaceHolder.demo.services.SparqlQueries.*;

@Slf4j
@Service
public class SensorReadingService {

    @Autowired
    private ExampleRepository repository;

    @Value("${SWOT_URL_PREFIX}")
    private String appUrlPrefix;

    public Page<SensorReading> getReadingsByType(SensorType type, PageRequest pageRequest) {
        // Primero obtener el total de elementos
        String countQueryString = COUNT_QUERY.formatted(type.getSosaProperty());
        long totalElements = executeCountQuery(countQueryString);

        // Luego obtener la página solicitada
        String queryString = BASE_QUERY.formatted(
                appUrlPrefix,
                appUrlPrefix,
                type.getSosaProperty(),
                pageRequest.getOffset(),
                pageRequest.getSize()
        );

        List<SensorReading> readings = executeReadingsQuery(queryString);

        return Page.of(readings, pageRequest, totalElements);
    }

    private long executeCountQuery(String queryString) {
        List<QuerySolution> solutions = repository.queryResultSet(queryString);
        if (!solutions.isEmpty()) {
            return solutions.getFirst().getLiteral("count").getLong();
        }
        return 0;
    }

    private List<SensorReading> executeReadingsQuery(String queryString) {
        List<SensorReading> readings = new ArrayList<>();
        List<QuerySolution> solutions = repository.queryResultSet(queryString);

        for (QuerySolution solution : solutions) {
            readings.add(SensorReading.builder()
                    .sensorId(solution.getLiteral("sensorId").getString())
                    .value(solution.getLiteral("value").getDouble())
                    .unit(solution.getLiteral("unit").getString())
                    .timestamp(DateTimeUtils.parseDateTime(solution.getLiteral("timestamp").getString()))
                    .processed(solution.contains("processed") &&
                            solution.getLiteral("processed").getBoolean())
                    .build());
        }
        return readings;
    }


    // Métodos específicos para cada tipo de sensores
    public Page<SensorReading> getTemperatureReadings(Integer page, Integer size) {
        return getReadingsByType(SensorType.TEMPERATURE, PageRequest.of(page, size));
    }

    public Page<SensorReading> getHumidityReadings(Integer page, Integer size) {
        return getReadingsByType(SensorType.HUMIDITY, PageRequest.of(page, size));
    }

    public Page<SensorReading> getNoiseReadings(Integer page, Integer size) {
        return getReadingsByType(SensorType.NOISE, PageRequest.of(page, size));
    }

    public Page<SensorReading> getAirQualityReadings(Integer page, Integer size) {
        return getReadingsByType(SensorType.AIR_QUALITY, PageRequest.of(page, size));
    }
}
