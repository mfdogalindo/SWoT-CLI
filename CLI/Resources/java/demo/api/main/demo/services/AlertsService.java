package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.enums.SensorType;
import PackagePlaceHolder.demo.models.Page;
import PackagePlaceHolder.demo.models.PageRequest;
import PackagePlaceHolder.demo.models.SensorReadingAlert;
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
public class AlertsService {

    @Autowired
    private ExampleRepository repository;

    @Value("${SWOT_URL_PREFIX}")
    private String appUrlPrefix;

    private long executeCountQuery(String queryString) {
        List<QuerySolution> solutions = repository.queryResultSet(queryString);
        if (!solutions.isEmpty()) {
            return solutions.getFirst().getLiteral("count").getLong();
        }
        return 0;
    }

    public Page<SensorReadingAlert> getReadingsWithAlerts(SensorType type, PageRequest pageRequest) {
        // Obtener total de elementos con alertas
        String countQueryString = COUNT_ALERTS_QUERY.formatted(appUrlPrefix, type.getSosaProperty());
        long totalElements = executeCountQuery(countQueryString);

        // Obtener la página solicitada
        String queryString = READINGS_WITH_ALERTS_QUERY.formatted(
                appUrlPrefix,
                type.getSosaProperty(),
                pageRequest.getOffset(),
                pageRequest.getSize()
        );

        List<SensorReadingAlert> readings = new ArrayList<>();
        List<QuerySolution> solutions = repository.queryResultSet(queryString);

        for (QuerySolution solution : solutions) {
            readings.add(SensorReadingAlert.builder()
                    .sensorId(solution.getLiteral("sensorId").getString())
                    .value(solution.getLiteral("value").getDouble())
                    .unit(solution.getLiteral("unit").getString())
                    .timestamp(DateTimeUtils.parseDateTime(solution.getLiteral("timestamp").getString()))
                    .alertType(solution.getLiteral("alertType").getString())
                    .severity(solution.getLiteral("severity").getString())
                    .message(solution.getLiteral("message").getString())
                    .build());
        }

        return Page.of(readings, pageRequest, totalElements);
    }

    // Métodos específicos para cada tipo con alertas
    public Page<SensorReadingAlert> getTemperatureAlerts(Integer page, Integer size) {
        return getReadingsWithAlerts(SensorType.TEMPERATURE, PageRequest.of(page, size));
    }

    public Page<SensorReadingAlert> getHumidityAlerts(Integer page, Integer size) {
        return getReadingsWithAlerts(SensorType.HUMIDITY, PageRequest.of(page, size));
    }

    public Page<SensorReadingAlert> getNoiseAlerts(Integer page, Integer size) {
        return getReadingsWithAlerts(SensorType.NOISE, PageRequest.of(page, size));
    }

    public Page<SensorReadingAlert> getAirQualityAlerts(Integer page, Integer size) {
        return getReadingsWithAlerts(SensorType.AIR_QUALITY, PageRequest.of(page, size));
    }

}
