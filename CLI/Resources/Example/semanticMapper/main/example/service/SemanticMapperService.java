package PackagePlaceHolder.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.springframework.stereotype.Service;
import org.apache.jena.vocabulary.XSD;
import org.apache.jena.rdf.model.ResourceFactory;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class SemanticMapperService {

    private static final String BASE_URI = "http://example.org/swot/";
    private static final String SOSA = "http://www.w3.org/ns/sosa/";
    private static final String SSN = "http://www.w3.org/ns/ssn/";
    private static final String IOT_LITE = "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#";

    // URIs para las unidades de medida
    private static final String QUDT = "http://qudt.org/vocab/unit/";
    private static final Resource CELSIUS = ResourceFactory.createResource(QUDT + "DEG_C");
    private static final Resource PERCENTAGE = ResourceFactory.createResource(QUDT + "PERCENT");
    private static final Resource INDEX = ResourceFactory.createResource(QUDT + "UNITLESS");

    private static final Property resultTime = ResourceFactory.createProperty(SOSA + "resultTime");

    private final ObjectMapper jsonMapper;
    private final TripleStoreService triplestoreService;

    public SemanticMapperService(ObjectMapper jsonMapper, TripleStoreService triplestoreService) {
        this.jsonMapper = jsonMapper;
        this.triplestoreService = triplestoreService;
    }

    public void mapSensorDataToRDF(String jsonData) {
        try {
            Map<String, Object> data = jsonMapper.readValue(jsonData, Map.class);
            Model model = ModelFactory.createDefaultModel();

            model.setNsPrefix("sosa", SOSA);
            model.setNsPrefix("ssn", SSN);
            model.setNsPrefix("iot-lite", IOT_LITE);

            String sensorId = (String) data.get("id");
            Double temperature = (Double) data.get("temperature");
            Double humidity = (Double) data.get("humidity");
            Integer airQuality = (Integer) data.get("airQuality");
            Long timestamp = (Long) data.get("timestamp");

            // Convertir timestamp a xsd:dateTime
            String xsdDateTime = convertTimestampToXSDDateTime(timestamp);

            Resource sensor = model.createResource(BASE_URI + "sensor/" + sensorId)
                    .addProperty(RDF.type, model.createResource(SSN + "System"))
                    .addProperty(RDF.type, model.createResource(SOSA + "Sensor"))
                    .addProperty(model.createProperty(IOT_LITE + "id"), sensorId);

            createObservation(model, sensor, "temperature", temperature, xsdDateTime, "Celsius");
            createObservation(model, sensor, "humidity", humidity, xsdDateTime, "Percentage");
            createObservation(model, sensor, "airQuality", airQuality, xsdDateTime, "Index");


            triplestoreService.saveModel(model);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping sensor data to RDF", e);
        }
    }

    private void createObservation(Model model, Resource sensor, String observableProperty, Object result, String xsdDateTime, String measurementUnit) {
        Resource observation = model.createResource(BASE_URI + "observation/" + observableProperty + "/" + sensor.getLocalName())
                .addProperty(RDF.type, model.createResource(SOSA + "Observation"))
                .addProperty(resultTime, model.createTypedLiteral(xsdDateTime, XSDDatatype.XSDdateTime))
                .addProperty(model.createProperty(SOSA + "madeBySensor"), sensor)
                .addProperty(model.createProperty(SOSA + "observedProperty"),
                        model.createResource(BASE_URI + "property/" + observableProperty));

        // Asociar la unidad de medida adecuada
        Resource unitResource;
        switch (measurementUnit.toLowerCase()) {
            case "celsius":
                unitResource = CELSIUS;
                break;
            case "percentage":
                unitResource = PERCENTAGE;
                break;
            case "index":
                unitResource = INDEX;
                break;
            default:
                throw new IllegalArgumentException("Unidad de medida desconocida: " + measurementUnit);
        }
        observation.addProperty(model.createProperty(SOSA + "hasUnit"), unitResource);


        // Determina el tipo de resultado (double o integer)
        if (result instanceof Double) {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"),
                    model.createTypedLiteral(result, XSDDatatype.XSDdouble));
        } else if (result instanceof Integer) {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"),
                    model.createTypedLiteral(result, XSDDatatype.XSDinteger));
        } else {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"),
                    model.createTypedLiteral(result.toString()));
        }

        sensor.addProperty(model.createProperty(SSN + "implements"),
                model.createResource(BASE_URI + "procedure/measure" + observableProperty.substring(0, 1).toUpperCase() + observableProperty.substring(1)));
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