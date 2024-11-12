package PackagePlaceHolder.demo.enums;

import lombok.Getter;

@Getter
public enum SensorType {
    TEMPERATURE("Temperature"),
    HUMIDITY("Humidity"),
    NOISE("NoiseLevel"),
    AIR_QUALITY("AirQuality");

    private final String sosaProperty;

    SensorType(String sosaProperty) {
        this.sosaProperty = sosaProperty;
    }
}