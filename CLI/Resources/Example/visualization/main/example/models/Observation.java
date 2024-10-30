package PackagePlaceHolder.example.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Observation {
    private String id;                  // URI de la observación
    private String sensorId;            // URI del sensor
    private LocalDateTime timestamp;    // Timestamp de la observación
    private String observedProperty;    // URI de la propiedad observada
    private Double result;              // Resultado numérico de la observación
    private String unit;                // Unidad de medida
}
