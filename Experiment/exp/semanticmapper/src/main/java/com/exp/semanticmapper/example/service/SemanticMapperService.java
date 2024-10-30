package com.exp.semanticmapper.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@Slf4j
@Service
public class SemanticMapperService {

    // Cache para sensores ya registrados
    private final Map<String, Resource> sensorCache;
    private final ObjectMapper jsonMapper;
    private final TripleStoreService triplestoreService;

    // Namespaces y prefijos
    private static final String BASE_URI = "http://example.org/swot/";
    private static final String SOSA_NS = "http://www.w3.org/ns/sosa/";
    private static final String SSN_NS = "http://www.w3.org/ns/ssn/";
    private static final String IOT_LITE_NS = "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#";
    private static final String GEO_NS = "http://www.w3.org/2003/01/geo/wgs84_pos#";
    private static final String QUDT_NS = "http://qudt.org/schema/qudt/";


    public SemanticMapperService(ObjectMapper jsonMapper, TripleStoreService triplestoreService) {
        this.jsonMapper = jsonMapper;
        this.triplestoreService = triplestoreService;
        this.sensorCache = new HashMap<>();
    }

    public void mapSensorDataToRDF(String jsonData) {
        try {
            Map<String, Object> data = jsonMapper.readValue(jsonData, Map.class);
            Model model = ModelFactory.createDefaultModel();

            // Configurar prefijos
            model.setNsPrefix("sosa", SOSA_NS);
            model.setNsPrefix("ssn", SSN_NS);
            model.setNsPrefix("iot-lite", IOT_LITE_NS);
            model.setNsPrefix("geo", GEO_NS);
            model.setNsPrefix("qudt", QUDT_NS);
            model.setNsPrefix("swot", BASE_URI);

            String sensorId = (String) data.get("id");
            Double temperature = (Double) data.get("temperature");
            Double humidity = (Double) data.get("humidity");
            Integer airQuality = (Integer) data.get("airQuality");
            Double noiseLevel = (Double) data.get("noiseLevel");
            Long timestamp = (Long) data.get("timestamp");
            Double latitude = (Double) data.get("latitude");
            Double longitude = (Double) data.get("longitude");
            String zone = (String) data.get("zone");



            // Crear o recuperar recurso del sensor
            Resource sensor = getOrCreateSensor(model, sensorId, latitude, longitude, zone);

            // Crear observación
            String observationId = UUID.randomUUID().toString();
            createObservation(model, observationId, sensor, temperature,
                    humidity, airQuality, noiseLevel, timestamp);


            triplestoreService.saveModel(model);
        } catch (Exception e) {
            log.error("Error mapping sensor data to RDF", e);
            throw new RuntimeException("Error mapping sensor data to RDF", e);
        }
    }


    private Resource getOrCreateSensor(Model model, String sensorId, Double latitude, Double longitude, String zone) {
        // Verificar cache
        if (sensorCache.containsKey(sensorId)) {
            return sensorCache.get(sensorId);
        }

        // Crear nuevo sensor
        Resource sensor = model.createResource(BASE_URI + "sensor/" + sensorId);

        // SSN/SOSA
        sensor.addProperty(RDF.type, model.createResource(SOSA_NS + "Sensor"))
                .addProperty(RDF.type, model.createResource(SSN_NS + "System"));

        // IoT-Lite
        sensor.addProperty(RDF.type, model.createResource(IOT_LITE_NS + "IoTDevice"));

        // Ubicación
        Resource location = model.createResource()
                .addProperty(RDF.type, model.createResource(GEO_NS + "Point"))
                .addProperty(model.createProperty(GEO_NS + "lat"),
                        model.createTypedLiteral(latitude))
                .addProperty(model.createProperty(GEO_NS + "long"),
                        model.createTypedLiteral(longitude));

        sensor.addProperty(model.createProperty(GEO_NS + "location"), location);

        // Zona
        sensor.addProperty(model.createProperty(BASE_URI + "zone"), zone);

        // Capacidades de observación
        addSensorCapabilities(model, sensor);

        // Agregar a cache
        sensorCache.put(sensorId, sensor);

        return sensor;
    }

    private void addSensorCapabilities(Model model, Resource sensor) {
        // Temperature capability
        Resource tempCapability = model.createResource()
                .addProperty(RDF.type, model.createResource(SSN_NS + "SystemCapability"))
                .addProperty(model.createProperty(SSN_NS + "forProperty"),
                        model.createResource(QUDT_NS + "Temperature"));

        // Humidity capability
        Resource humCapability = model.createResource()
                .addProperty(RDF.type, model.createResource(SSN_NS + "SystemCapability"))
                .addProperty(model.createProperty(SSN_NS + "forProperty"),
                        model.createResource(QUDT_NS + "RelativeHumidity"));

        // Air Quality capability
        Resource aqiCapability = model.createResource()
                .addProperty(RDF.type, model.createResource(SSN_NS + "SystemCapability"))
                .addProperty(model.createProperty(SSN_NS + "forProperty"),
                        model.createResource(BASE_URI + "AirQualityIndex"));

        // Noise Level capability
        Resource noiseCapability = model.createResource()
                .addProperty(RDF.type, model.createResource(SSN_NS + "SystemCapability"))
                .addProperty(model.createProperty(SSN_NS + "forProperty"),
                        model.createResource(QUDT_NS + "SoundPressureLevel"));

        sensor.addProperty(model.createProperty(SSN_NS + "hasSystemCapability"), tempCapability)
                .addProperty(model.createProperty(SSN_NS + "hasSystemCapability"), humCapability)
                .addProperty(model.createProperty(SSN_NS + "hasSystemCapability"), aqiCapability)
                .addProperty(model.createProperty(SSN_NS + "hasSystemCapability"), noiseCapability);
    }

    private void createObservation(Model model, String observationId, Resource sensor,
                                   Double temperature, Double humidity,
                                   Integer airQuality, Double noiseLevel,
                                   Long timestamp) {

        // Convertir timestamp a xsd:dateTime
        String xsdDateTime = convertTimestampToXSDDateTime(timestamp);

        // Crear observación base
        Resource observation = model.createResource(BASE_URI + "observation/" + observationId)
                .addProperty(RDF.type, model.createResource(SOSA_NS + "Observation"))
                .addProperty(model.createProperty(SOSA_NS + "madeBySensor"), sensor)
                .addProperty(model.createProperty(SOSA_NS + "resultTime"),
                        model.createTypedLiteral(xsdDateTime, XSDDatatype.XSDdateTime))
                .addProperty(model.createProperty(BASE_URI + "processed"),
                        model.createTypedLiteral(false));

        // Agregar resultados individuales
        addObservationResult(model, observation, "Temperature", temperature, "DegreeCelsius");
        addObservationResult(model, observation, "RelativeHumidity", humidity, "Percent");
        addObservationResult(model, observation, "AirQualityIndex", airQuality.doubleValue(), "AQI");
        addObservationResult(model, observation, "SoundPressureLevel", noiseLevel, "Decibel");

    }

    private void addObservationResult(Model model, Resource observation, String property,
                                      Double value, String unit) {
        Resource result = model.createResource()
                .addProperty(RDF.type, model.createResource(SOSA_NS + "Result"))
                .addProperty(model.createProperty(QUDT_NS + "numericValue"),
                        model.createTypedLiteral(value))
                .addProperty(model.createProperty(QUDT_NS + "unit"),
                        model.createResource(QUDT_NS + unit));

        observation.addProperty(model.createProperty(SOSA_NS + "hasResult"), result)
                .addProperty(model.createProperty(SOSA_NS + "observedProperty"),
                        model.createResource(QUDT_NS + property));
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