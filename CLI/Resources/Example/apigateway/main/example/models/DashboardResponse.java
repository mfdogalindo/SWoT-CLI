package PackagePlaceHolder.example.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private List<TemperatureAlert> temperatureAlerts;
    private List<AirQualityStatus> airQualityStatuses;
    private List<ComfortStatus> comfortLevels;
    private List<HumidityLevel> humidityLevels;
    private LocalDateTime lastUpdate;
}