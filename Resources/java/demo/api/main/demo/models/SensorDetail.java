package PackagePlaceHolder.demo.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SensorDetail {
    private String id;
    private String zone;
    private Double latitude;
    private Double longitude;
    private Integer totalObservations;
    private Integer totalAlerts;
    private LocalDateTime lastReading;
}
