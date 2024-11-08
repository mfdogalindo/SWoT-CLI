package PackagePlaceHolder.demo.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SensorReadingAlert {
    private String sensorId;
    private Double value;
    private String unit;
    private LocalDateTime timestamp;
    private String alertType;
    private String severity;
    private String message;
}
