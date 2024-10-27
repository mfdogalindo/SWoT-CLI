package PackagePlaceHolder.example.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HumidityStatus {
    private String observationId;       // URI de la observación
    private String sensorId;            // URI del sensor
    private Double humidity;            // Valor porcentual de humedad
    private String status;              // "Good", etc.
    private LocalDateTime timestamp;    // Timestamp de la observación
}
