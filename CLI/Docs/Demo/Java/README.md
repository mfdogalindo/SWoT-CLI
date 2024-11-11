# Documentación Técnica: Implementación Demo Java del Framework SWoT

## 1. Introducción
### 1.1 Propósito
Este proyecto demuestra una implementación práctica del Framework SWoT (Semantic Web of Things) para el monitoreo ambiental mediante sensores IoT con capacidades semánticas empleando Java.

### 1.2 Alcance
El sistema implementa un conjunto completo de servicios para la captura, procesamiento y visualización de datos ambientales, siguiendo los principios y arquitectura del Framework SWoT.

## 2. Arquitectura del Sistema
### 2.1 Visión General
El sistema sigue una arquitectura de microservicios distribuida que implementa las capas principales del Framework SWoT:

- **Capa de Dispositivos IoT**: Implementada a través del servicio `sensors`
- **Capa de Abstracción Semántica**: Implementada en el servicio `mapper`
- **Capa de Gestión de Conocimiento**: Implementada en el servicio `reasoner`
- **Capa de Servicios**: Implementada en los servicios `api` y `gateway`
- **Capa de Aplicación**: Implementada en el servicio `dashboard`

### 2.2 Componentes Principales
1. **Sensores Simulados (sensors)**
   - Genera datos ambientales simulados
   - Implementa comunicación MQTT
   - Simula múltiples nodos de sensores

2. **Mapper Semántico (mapper)**
   - Transforma datos crudos a RDF
   - Implementa ontologías SSN/SOSA
   - Gestiona el mapeo a tripletas semánticas

3. **Razonador Semántico (reasoner)**
   - Aplica reglas de inferencia
   - Genera alertas basadas en patrones
   - Procesa datos semánticos

4. **API REST (api)**
   - Expone endpoints REST
   - Gestiona consultas SPARQL
   - Implementa paginación y filtrado

5. **Gateway (gateway)**
   - Enruta peticiones
   - Balancea carga
   - Gestiona acceso a servicios

6. **Dashboard (dashboard)**
   - Visualiza datos de sensores
   - Muestra alertas
   - Permite monitoreo en tiempo real

## 3. Implementación de Capas del Framework

### 3.1 Capa de Dispositivos IoT
```java
// Implementada en SensorSimulator.java
public class SensorSimulator {
    // Simula dispositivos IoT con los siguientes parámetros:
    // - Temperatura (15°C - 40°C)
    // - Humedad (30% - 100%)
    // - Calidad del aire (50 - 350 AQI)
    // - Nivel de ruido (30 dB - 100 dB)
}
```

### 3.2 Capa de Abstracción Semántica
```java
// Implementada en SemanticMapperService.java
public class SemanticMapperService {
    // Mapeo a ontologías:
    // - SSN/SOSA para sensores y observaciones
    // - IoT-Lite para dispositivos
    // - QUDT para unidades de medida
}
```

### 3.3 Capa de Gestión de Conocimiento
```java
// Implementada en SemanticReasoner.java
public class SemanticReasoner {
    // Procesamiento semántico:
    // - Inferencia de alertas
    // - Procesamiento de reglas
    // - Gestión de conocimiento
}
```

## 4. Configuración y Despliegue

### 4.1 Requisitos Previos
- Docker y Docker Compose
- Java 23 (imagen incluida en docker-compose.yml)
- Apache Jena Fuseki (imagen incluida en docker-compose.yml)
- Eclipse Mosquitto (imagen incluida en docker-compose.yml)

### 4.2 Estructura de Servicios Docker
```yaml
services:
  jena:
    # Triplestore semántico
  mosquitto:
    # Broker MQTT
  sensors:
    # Simulador de sensores
  mapper:
    # Servicio de mapeo semántico
  reasoner:
    # Servicio de razonamiento
  api:
    # API REST
  gateway:
    # Gateway de servicios
  dashboard:
    # Interfaz de usuario
```

## 5. APIs y Endpoints

### 5.1 API REST
- `GET /api/v1/enviroment/{sensor-type}`
- `GET /api/v1/alerts/{alert-type}`
- `GET /api/v1/sensor/{sensorId}`

### 5.2 Endpoints MQTT
- Topic: `sensors_swot`
- QoS: 2
- Formato: JSON con datos de sensores

## 6. Modelo Semántico

### 6.1 Ontologías Utilizadas
- SSN/SOSA para sensores y observaciones
- IoT-Lite para dispositivos y servicios
- QUDT para unidades y medidas

### 6.2 Ejemplos de Datos RDF
```turtle
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix qudt: <http://qudt.org/schema/qudt#> .

<observation/SENSOR-001> a sosa:Observation ;
    sosa:madeBySensor <sensor/SENSOR-001> ;
    sosa:hasResult [
        qudt:numericValue "25.5"^^xsd:decimal ;
        qudt:unit unit:DegreeCelsius
    ] .
```

## 7. Guía de Desarrollo

Es posible ejecutar directamente con el comando run de la herramienta SWoT-CLI, sin embargo, cada contenedor se puede desplegar con las siguientes instrucciones:

### 7.1 Compilación
```bash
# Compilar servicios individuales
./gradlew build

# Construir imágenes Docker
docker-compose build
```

### 7.2 Despliegue
```bash
# Iniciar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

## 8. Monitoreo y Mantenimiento

### 8.1 Logs
- Logs centralizados por servicio
- Niveles de log configurables
- Rotación de logs implementada

### 8.2 Métricas
- Métricas de sensores
- Estadísticas de procesamiento
- Rendimiento del sistema

## 9. Limitaciones y Consideraciones
- Sistema demo con propósitos educativos
- Datos simulados
- Escalabilidad limitada en configuración actual
- Sin implementación de persistencia duradera
- Sin configuraciones de autenticación y gestión de contraseñas
