# 3. Implementación de Capas del Framework

## 3.1 Capa de Dispositivos IoT

### 3.1.1 Modelo de Dispositivos
```java
@Data
public class SensorNodeRecord {
    String id;                // Identificador único del sensor
    Long timestamp;          // Timestamp en milisegundos
    Double temperature;      // Temperatura en °C
    Double humidity;         // Humedad relativa en %
    Integer airQuality;      // Índice de calidad del aire
    Double noiseLevel;       // Nivel de ruido en dB
    Double latitude;         // Coordenada geográfica
    Double longitude;        // Coordenada geográfica
    String zone;            // Zona de ubicación
}
```

### 3.1.2 Configuración MQTT
```java
@Configuration
public class MqttConfig {
    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { brokerUrl });
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setKeepAliveInterval(60);
        return factory;
    }
}
```

### 3.1.3 Simulación de Sensores
```java
@Component
class SensorSimulator {
    private Map<String, SensorLocation> initializeSensorLocations() {
        Map<String, SensorLocation> locations = new HashMap<>();
        // 10 sensores distribuidos en 5 zonas
        locations.put("NODE-001", new SensorLocation(2.4422, -76.6122, "ZONE-NORTH"));
        // ... más sensores
        return locations;
    }

    @Scheduled(fixedRate = 60000)
    public void simulateSensorData() {
        // Generación de datos cada minuto
        double temperature = 15 + (random.nextDouble() * 25); // 15°C - 40°C
        double humidity = 30 + (random.nextDouble() * 70);    // 30% - 100%
        // ... más parámetros
    }
}
```

## 3.2 Capa de Abstracción Semántica

### 3.2.1 Mapeo Semántico
```java
@Service
public class SemanticMapperService {
    private static final String SOSA_NS = "http://www.w3.org/ns/sosa/";
    private static final String QUDT_NS = "http://qudt.org/schema/qudt#";
    private static final String UNIT_NS = "http://qudt.org/vocab/unit/";

    public void mapSensorDataToRDF(SensorNodeRecord data) {
        // Crear recurso para el nodo sensor
        Resource node = model.createResource(appUrlPrefix + "node/" + data.getId())
                .addProperty(RDF.type, model.createResource(IOTLITE_NS + "Device"))
                .addProperty(model.createProperty(IOTLITE_NS, "hasZone"), data.getZone());

        // Crear observaciones para cada medición
        createSensorObservation(node, data.getId() + "-T", "Temperature",
                              data.getTemperature(), UNIT_NS + "DegreeCelsius",
                              data.getTimestamp());
        // ... más observaciones
    }
}
```

### 3.2.2 Transformación de Datos
```java
private void createSensorObservation(Resource node, String sensorId,
                                   String type, double value,
                                   String unitUri, long timestamp) {
    // Crear sensor
    Resource sensor = model.createResource(appUrlPrefix + "sensor/" + sensorId)
            .addProperty(RDF.type, model.createResource(SOSA_NS + "Sensor"))
            .addProperty(model.createProperty(SOSA_NS, "isHostedBy"), node);

    // Crear observación
    Resource observation = model.createResource(appUrlPrefix + "observation/" +
                                             sensorId + "/" + System.currentTimeMillis())
            .addProperty(RDF.type, model.createResource(SOSA_NS + "Observation"))
            .addProperty(model.createProperty(SOSA_NS, "madeBySensor"), sensor);

    // Agregar resultado con unidad
    Resource quantityValue = model.createResource()
            .addProperty(RDF.type, model.createResource(QUDT_NS + "QuantityValue"))
            .addProperty(model.createProperty(QUDT_NS, "numericValue"),
                        model.createTypedLiteral(value, XSDDatatype.XSDdecimal))
            .addProperty(model.createProperty(QUDT_NS, "unit"),
                        model.createResource(unitUri));
}
```

## 3.3 Capa de Gestión de Conocimiento

### 3.3.1 Razonamiento Semántico
```java
@Service
public class SemanticReasoner {
    @Scheduled(initialDelay = 30000, fixedRate = 60000)
    public void performReasoning() {
        // Cargar observaciones no procesadas
        Model data = loadDataFromTriplestore();

        // Aplicar reglas de inferencia
        List<Rule> rules = loadRules();
        GenericRuleReasoner reasoner = new GenericRuleReasoner(rules);
        InfModel infModel = ModelFactory.createInfModel(reasoner, data);

        // Extraer nuevas inferencias
        Model newInferences = ModelFactory.createDefaultModel();
        extractInferences(infModel, newInferences);

        // Almacenar resultados
        storeInferencesAndMarkProcessed(data, newInferences);
    }
}
```

### 3.3.2 Consultas SPARQL
```java
public class SparqlQueries {
    public static final String BASE_QUERY = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX qudt: <http://qudt.org/schema/qudt#>

        SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?processed
        WHERE {
            ?sensor rdf:type sosa:Sensor .
            BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?sensorId)

            ?observation sosa:madeBySensor ?sensor ;
                       sosa:observedProperty sosa:%s ;
                       sosa:resultTime ?timestamp ;
                       sosa:hasResult ?result .

            ?result qudt:numericValue ?value ;
                   qudt:unit ?unitResource .
        }
        ORDER BY DESC(?timestamp)
        LIMIT %d
        OFFSET %d
    """;
}
```
