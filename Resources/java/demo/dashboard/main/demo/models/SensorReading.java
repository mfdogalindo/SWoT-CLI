package PackagePlaceHolder.demo.models;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SensorReading {
    private String sensorId;
    private Double value;
    private String unit;
    private LocalDateTime timestamp;
    private boolean processed;
}
