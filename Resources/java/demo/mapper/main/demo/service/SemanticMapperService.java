package PackagePlaceHolder.demo.service;

import PackagePlaceHolder.demo.model.SensorNodeRecord;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class SemanticMapperService {

    private static final String SOSA_NS = "http://www.w3.org/ns/sosa/";
    private static final String SSN_NS = "http://www.w3.org/ns/ssn/";
    private static final String IOTLITE_NS = "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#";
    private static final String GEO_NS = "http://www.w3.org/2003/01/geo/wgs84_pos#";
    private static final String QUDT_NS = "http://qudt.org/schema/qudt#";
    private static final String UNIT_NS = "http://qudt.org/vocab/unit/";

    @Value("${SWOT_URL_PREFIX}")
    private String appUrlPrefix;

    private Model model;

    private final TripleStoreService triplestoreService;

    public SemanticMapperService(TripleStoreService triplestoreService) {
        this.triplestoreService = triplestoreService;
        this.model = ModelFactory.createDefaultModel();
        this.model.setNsPrefix("sosa", SOSA_NS);
        this.model.setNsPrefix("ssn", SSN_NS);
        this.model.setNsPrefix("iotlite", IOTLITE_NS);
        this.model.setNsPrefix("geo", GEO_NS);
        this.model.setNsPrefix("qudt", QUDT_NS);
    }

    public void mapSensorDataToRDF(SensorNodeRecord data) {
        try {

            // Crear recurso para el nodo
            Resource node = model.createResource( appUrlPrefix + "node/" + data.getId())
                    .addProperty(RDF.type, model.createResource(IOTLITE_NS + "Device"))
                    .addProperty(model.createProperty(IOTLITE_NS, "hasZone"), data.getZone())
                    .addProperty(model.createProperty(GEO_NS, "lat"), String.valueOf(data.getLatitude()), XSDDatatype.XSDdecimal)
                    .addProperty(model.createProperty(GEO_NS, "long"), String.valueOf(data.getLongitude()), XSDDatatype.XSDdecimal);

            // Crear observaciones para cada tipo de sensor en el nodo
            createSensorObservation(node, data.getId() + "-T", "Temperature", data.getTemperature(), UNIT_NS + "DegreeCelsius", data.getTimestamp());
            createSensorObservation(node, data.getId() + "-H", "Humidity", data.getHumidity(), UNIT_NS + "Percent", data.getTimestamp());
            createSensorObservation(node, data.getId() + "-AQ", "AirQuality", data.getAirQuality(), UNIT_NS + "AQI", data.getTimestamp());
            createSensorObservation(node, data.getId() + "-N", "NoiseLevel", data.getNoiseLevel(), UNIT_NS + "Decibel", data.getTimestamp());

            triplestoreService.saveModel(model);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping sensor data to RDF", e);
        }
    }

    private void createSensorObservation(Resource node, String sensorId, String type, double value, String unitUri, long timestamp) {
        // Crear recurso para el sensor específico
        Resource sensor = model.createResource(appUrlPrefix + "sensor/" + sensorId)
                .addProperty(RDF.type, model.createResource(SOSA_NS + "Sensor"))
                .addProperty(model.createProperty(SOSA_NS, "isHostedBy"), node);

        // Crear recurso para la observación
        Resource observation = model.createResource(appUrlPrefix + "observation/" + sensorId + "/" + System.currentTimeMillis())
                .addProperty(RDF.type, model.createResource(SOSA_NS + "Observation"))
                .addProperty(model.createProperty(SOSA_NS, "hasFeatureOfInterest"), sensor)
                .addProperty(model.createProperty(SOSA_NS, "observedProperty"), model.createResource(SOSA_NS + type))
                .addProperty(model.createProperty(SOSA_NS, "resultTime"), model.createTypedLiteral(convertTimestampToXSDDateTime(timestamp), XSDDatatype.XSDdateTime));

        // Crear recurso para el valor de la cantidad con su unidad
        Resource quantityValue = model.createResource()
                .addProperty(RDF.type, model.createResource(QUDT_NS + "QuantityValue"))
                .addProperty(model.createProperty(QUDT_NS, "numericValue"), model.createTypedLiteral(value, XSDDatatype.XSDdecimal))
                .addProperty(model.createProperty(QUDT_NS, "unit"), model.createResource(unitUri));

        // Asociar la observación con el resultado
        observation.addProperty(model.createProperty(SOSA_NS, "hasResult"), quantityValue);
    }

    /**
     * Convierte un timestamp en milisegundos a formato xsd:dateTime
     */
    private String convertTimestampToXSDDateTime(long timestampMillis) {
        // Convertir millisegundos a Instant
        Instant instant = Instant.ofEpochMilli(timestampMillis);

        // Formatear según el formato requerido por xsd:dateTime
        // Formato: YYYY-MM-DDThh:mm:ss.SSSZ
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                .withZone(ZoneOffset.UTC);

        return formatter.format(instant);
    }
}
