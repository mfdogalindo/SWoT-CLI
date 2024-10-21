package PackagePlaceHolder.example.service;

import org.apache.jena.datatypes.xsd.XSDDatatype;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.*;
import org.springframework.stereotype.Service;

@Service
public class SemanticMapperService {

    private static final String BASE_URI = "http://example.org/swot/";
    private static final String SOSA = "http://www.w3.org/ns/sosa/";
    private static final String SSN = "http://www.w3.org/ns/ssn/";
    private static final String IOT_LITE = "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#";

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

            Resource sensor = model.createResource(BASE_URI + "sensor/" + sensorId)
                    .addProperty(RDF.type, model.createResource(SSN + "System"))
                    .addProperty(RDF.type, model.createResource(SOSA + "Sensor"))
                    .addProperty(model.createProperty(IOT_LITE + "id"), sensorId);

            createObservation(model, sensor, "temperature", temperature);
            createObservation(model, sensor, "humidity", humidity);
            createObservation(model, sensor, "airQuality", airQuality);

            triplestoreService.saveModel(model);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping sensor data to RDF", e);
        }
    }

    private void createObservation(Model model, Resource sensor, String observableProperty, Object result) {
        Resource observation = model.createResource(BASE_URI + "observation/" + observableProperty + "/" + sensor.getLocalName())
                .addProperty(RDF.type, model.createResource(SOSA + "Observation"))
                .addProperty(model.createProperty(SOSA + "madeBySensor"), sensor)
                .addProperty(model.createProperty(SOSA + "observedProperty"),
                        model.createResource(BASE_URI + "property/" + observableProperty));
    
        // Determina el tipo de resultado (double o integer)
        if (result instanceof Double) {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"), 
                    model.createTypedLiteral((Double) result, XSDDatatype.XSDdouble));
        } else if (result instanceof Integer) {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"), 
                    model.createTypedLiteral((Integer) result, XSDDatatype.XSDinteger));
        } else {
            observation.addProperty(model.createProperty(SOSA + "hasSimpleResult"),
                    model.createTypedLiteral(result.toString()));
        }
    
        sensor.addProperty(model.createProperty(SSN + "implements"),
                model.createResource(BASE_URI + "procedure/measure" + observableProperty.substring(0, 1).toUpperCase() + observableProperty.substring(1)));
    }
}
