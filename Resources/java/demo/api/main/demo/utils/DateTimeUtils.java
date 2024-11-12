package PackagePlaceHolder.demo.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateTimeUtils {
    
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // Parsear el string a Instant (maneja el formato ISO con Z)
            Instant instant = Instant.parse(dateTimeStr);
            // Convertir a LocalDateTime usando la zona horaria del sistema
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (DateTimeParseException e) {
            // Si falla, intentar otros formatos comunes
            try {
                return LocalDateTime.parse(dateTimeStr);
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("Cannot parse datetime: " + dateTimeStr, ex);
            }
        }
    }
}