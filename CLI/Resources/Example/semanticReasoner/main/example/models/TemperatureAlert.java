package PackagePlaceHolder.example.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TemperatureAlert {
    private String observationId;       // URI de la observación
    private String sensorId;            // URI del sensor
    private Double temperature;         // Valor de temperatura
    private String alertLevel;          // "High" o "Low"
    private LocalDateTime timestamp;    // Timestamp de la observación
}
