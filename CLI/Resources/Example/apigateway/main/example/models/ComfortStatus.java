package PackagePlaceHolder.example.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComfortStatus {
    private String observationId;           // URI de la observación
    private String sensorId;                // URI del sensor
    private Double temperature;             // Valor de temperatura
    private Double humidity;                // Valor de humedad
    private String comfortLevel;            // "Optimal", etc.
    private LocalDateTime timestamp;        // Timestamp de la observación
}
