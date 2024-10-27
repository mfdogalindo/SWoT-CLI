package PackagePlaceHolder.example.services;

import PackagePlaceHolder.example.repositories.ExampleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class SemanticReasoner {

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    private ExampleRepository repository;

    @Value("${TRIPLESTORE_URL:http://localhost:3030}")
    private String triplestoreEndpoint;

    @Value("${TRIPLESTORE_DATASET:swot}")
    private String triplestoreDataset;

    @Value("${TRIPLESTORE_USERNAME")
    private String triplestoreUsername;

    @Value("${TRIPLESTORE_PASSWORD}")
    private String triplestorePassword;

    @Value("${RULES_FILE:rules.txt}")
    private String rulesFileName;
    
    private Long elapsedTime;


    public void performReasoning() {
        // 1. Cargar datos del triplestore
        elapsedTime = System.currentTimeMillis();
        Model data = loadDataFromTriplestore();

        // 2. Cargar reglas
        List<Rule> rules = loadRules();

        // 3. Crear razonador
        Reasoner reasoner = new GenericRuleReasoner(rules);
        InfModel infModel = ModelFactory.createInfModel(reasoner, data);

        // 4. Realizar inferencias
        StmtIterator inferences = infModel.listStatements();

        // 5. Almacenar nuevas inferencias en el triplestore
        storeInferences(inferences);
    }

    private Model loadDataFromTriplestore() {
        // Obteniendo datos del triplestore de observaciones que no han sido inferidas
        String queryString = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX swot: <http://example.org/swot/property/>
                PREFIX inference: <http://example.org/swot/inference/>
                
                CONSTRUCT {
                  ?observation ?p ?o
                }
                WHERE {
                  ?observation rdf:type sosa:Observation ;
                               ?p ?o .
                
                  FILTER NOT EXISTS { ?observation inference:processed true }             
                }
                """;
        return repository.queryModel(queryString);
    }

    private List<Rule> loadRules() {
        // Cargando archivo de reglas usando springboot resouceLoader
        try {
            org.springframework.core.io.Resource rulesResource = resourceLoader.getResource("classpath:" + rulesFileName);
            return Rule.rulesFromURL(rulesResource.getURL().toString());
        } catch (IOException e) {
            throw new RuntimeException("Error loading rules: " + e.getMessage());
        }
    }

    private void storeInferences(StmtIterator inferences) {
        Model newInferences = ModelFactory.createDefaultModel();
        int countInferences = 0;
        // Convertir StmtIterator a un Model
        while (inferences.hasNext()) {
            Statement stmt = inferences.next();
            newInferences.add(stmt); // Agregar cada inferencia al modelo
            countInferences++;
        }

        // Marcar observaciones como procesadas
        Model processedMarks = ModelFactory.createDefaultModel();
        ResIterator observations = newInferences.listSubjects();
        while (observations.hasNext()) {
            Resource observation = observations.nextResource();
            processedMarks.add(observation, ResourceFactory.createProperty("http://example.org/swot/inference/processed"), ResourceFactory.createTypedLiteral(true));
        }

        // Guardar las inferencias y marcas en el triplestore
        try (RDFConnection conn = RDFConnection.connectPW(triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {
            conn.load(newInferences); // Cargar el modelo de inferencias en el triplestore
            conn.load(processedMarks); // Marcar las observaciones como procesadas
            log.info("Inferences added: {} - Elapsed time: {}", countInferences, System.currentTimeMillis() - elapsedTime);
        } catch (Exception e) {
            log.error("Error storing inferences: {}", e.getMessage());
        }
    }

}