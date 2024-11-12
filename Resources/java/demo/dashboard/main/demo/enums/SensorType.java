package PackagePlaceHolder.demo.enums;

import lombok.Getter;

@Getter
public enum SensorType {
    TEMPERATURE("temperature", "Temperature", "temperature", "°C"),
    HUMIDITY("humidity", "Humidity", "humidity","%"),
    NOISE("noise", "Noise Level", "noise","dB"),
    AIR_QUALITY("air-quality", "Air Quality", "airQuality","AQI");  // Verifica que este endpoint coincida con el API

    private final String endpoint;
    private final String displayName;
    private final String defaultUnit;
    private final String alias;

    SensorType(String endpoint, String displayName, String alias, String defaultUnit) {
        this.endpoint = endpoint;
        this.displayName = displayName;
        this.alias = alias;
        this.defaultUnit = defaultUnit;
    }
}
