package PackagePlaceHolder.demo.model;

import lombok.Data;

@Data
public class SensorNodeRecord {
    String id;
    Long timestamp;
    Double temperature;
    Double humidity;
    Integer airQuality;
    Double noiseLevel;
    Double latitude;
    Double longitude;
    String zone;
}
