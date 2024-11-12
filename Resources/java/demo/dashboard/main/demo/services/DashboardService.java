package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.enums.SensorType;
import PackagePlaceHolder.demo.models.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class DashboardService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${API_URL}")
    private String apiBaseUrl;

    /**
     * Obtiene lecturas de sensores por tipo
     */
    public Page<SensorReading> getSensorReadings(SensorType type, int page, int size) {
        String url = String.format("%s/api/v1/enviroment/%s?page={page}&size={size}",
                apiBaseUrl, type.getEndpoint());

        try {
            ResponseEntity<Page<SensorReading>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Page<SensorReading>>() {},
                    page, size
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching {} readings: {}", type.getDisplayName(), e.getMessage());
            return Page.empty(); // Retorna una página vacía en caso de error
        }
    }

    /**
     * Obtiene alertas por tipo de sensor
     */
    public Page<SensorReadingAlert> getSensorAlerts(SensorType type, int page, int size) {
        String url = String.format("%s/api/v1/alerts/%s?page={page}&size={size}",
                apiBaseUrl, type.getEndpoint());

        try {
            ResponseEntity<Page<SensorReadingAlert>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Page<SensorReadingAlert>>() {},
                    page, size
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching {} alerts: {}", type.getDisplayName(), e.getMessage());
            return Page.empty();
        }
    }

    /**
     * Obtiene detalles de todos los sensores
     */
    public Page<SensorDetail> getAllSensors(int page, int size) {
        String url = String.format("%s/api/v1/sensor?page={page}&size={size}", apiBaseUrl);

        try {
            ResponseEntity<Page<SensorDetail>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Page<SensorDetail>>() {},
                    page, size
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching sensor details: {}", e.getMessage());
            return Page.empty();
        }
    }

    /**
     * Obtiene detalles de un sensor específico
     */
    public SensorDetail getSensorById(String sensorId) {
        String url = String.format("%s/api/v1/sensor/{sensorId}", apiBaseUrl);

        try {
            return restTemplate.getForObject(url, SensorDetail.class, sensorId);
        } catch (Exception e) {
            log.error("Error fetching sensor details for ID {}: {}", sensorId, e.getMessage());
            return null;
        }
    }
}
