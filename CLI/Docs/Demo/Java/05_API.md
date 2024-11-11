# 5. APIs y Endpoints

## 5.1 Documentación OpenAPI

### 5.1.1 Acceso a la Documentación
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/api-docs`
- OpenAPI YAML: `http://localhost:8081/api-docs.yaml`

### 5.1.2 Configuración OpenAPI
```properties
# application.properties
server.port=8081
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.enabled=true
springdoc.api-docs.enabled=true
```

### 5.1.3 Anotaciones OpenAPI

Esta es una sugerencia de cómo se pueden documentar los endpoints de la API REST con anotaciones OpenAPI en Spring Boot.

```java
@RestController
@RequestMapping("/api/v1/enviroment")
@Tag(name = "Environmental Readings", description = "APIs for retrieving sensor readings")
public class EnvironmentalController {

    @Operation(
        summary = "Get temperature readings",
        description = "Retrieve paginated temperature readings from sensors"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved readings",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid page parameters"
        )
    })
    @GetMapping("/temperature")
    public ResponseEntity<Page<SensorReading>> getTemperatureReadings(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(required = false) Integer page,
            @Parameter(description = "Page size")
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(readingService.getTemperatureReadings(page, size));
    }
}
```

## 5.2 API REST

### 5.2.1 Endpoints de Ambiente
#### Base URL: `/api/v1/enviroment`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/temperature` | Lecturas de temperatura |
| GET | `/humidity` | Lecturas de humedad |
| GET | `/noise` | Lecturas de ruido |
| GET | `/air-quality` | Lecturas de calidad del aire |

#### Parámetros de Query
- `page`: Número de página (opcional, default: 0)
- `size`: Tamaño de página (opcional, default: 50)

#### Ejemplo de Respuesta
```json
{
    "content": [{
        "sensorId": "NODE-001",
        "value": 25.5,
        "unit": "DegreeCelsius",
        "timestamp": "2024-11-11T10:15:30Z",
        "processed": true
    }],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 100,
    "totalPages": 10
}
```

### 5.2.2 Endpoints de Alertas
#### Base URL: `/api/v1/alerts`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/temperature` | Alertas de temperatura |
| GET | `/humidity` | Alertas de humedad |
| GET | `/noise` | Alertas de ruido |
| GET | `/air-quality` | Alertas de calidad del aire |

#### Modelo de Alerta
```json
{
    "sensorId": "NODE-001",
    "value": 35.8,
    "unit": "DegreeCelsius",
    "timestamp": "2024-11-11T10:15:30Z",
    "alertType": "HighTemperature",
    "severity": "WARNING",
    "message": "Temperature exceeds normal range"
}
```

### 5.2.3 Endpoints de Sensores
#### Base URL: `/api/v1/sensor`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/{sensorId}` | Detalles de un sensor |
| GET | `/` | Lista de sensores |

#### Modelo de Sensor
```json
{
    "id": "NODE-001",
    "zone": "ZONE-NORTH",
    "latitude": 2.4422,
    "longitude": -76.6122,
    "totalObservations": 1440,
    "totalAlerts": 12,
    "lastReading": "2024-11-11T10:15:30Z"
}
```

## 5.3 MQTT Topics y Mensajes

### 5.3.1 Topics Principales
```plaintext
sensors/data           # Datos crudos de sensores
sensors/status        # Estado de los sensores
alerts/environmental  # Alertas generadas
```

### 5.3.2 Configuración MQTT
```java
@Configuration
public class MqttConfig {
    @Value("${MQTT_BROKER:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${MQTT_TOPIC:sensors/data}")
    private String topic;

    @Value("${MQTT_CLIENT:semantic-mapper}")
    private String clientId;
}
```

### 5.3.3 Formato de Mensajes
```json
{
    "id": "NODE-001",
    "timestamp": 1699696530000,
    "temperature": 25.5,
    "humidity": 65.0,
    "airQuality": 85,
    "noiseLevel": 45.5,
    "latitude": 2.4422,
    "longitude": -76.6122,
    "zone": "ZONE-NORTH"
}
```

### 5.3.4 Calidad de Servicio (QoS)
- Publicación de datos: QoS 2 (Exactly once)
- Estado de sensores: QoS 1 (At least once)
- Alertas: QoS 2 (Exactly once)

## 5.4 Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|-----------|
| 400 | Parámetros de solicitud inválidos | Verificar parámetros de paginación |
| 404 | Recurso no encontrado | Verificar ID del sensor |
| 429 | Demasiadas solicitudes | Implementar rate limiting |
| 500 | Error interno del servidor | Contactar al administrador |

## 5.5 Consideraciones de Seguridad

### 5.5.1 Autenticación
- API REST: Por implementar según requisitos
- MQTT: Autenticación básica configurada en broker
- Swagger UI: Acceso público en ambiente de desarrollo

### 5.5.2 Rate Limiting
```properties
# Por implementar en gateway
resilience4j.ratelimiter.instances.basic.limitForPeriod=100
resilience4j.ratelimiter.instances.basic.limitRefreshPeriod=1s
```

### 5.5.3 CORS

Esta es la sugerencia de configuración para Spring Boot:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8090")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```
