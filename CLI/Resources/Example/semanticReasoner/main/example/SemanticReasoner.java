package PackagePlaceHolder.example;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class SemanticReasoner {

    @Autowired
    ResourceLoader resourceLoader;

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


    public void performReasoning() {
        // 1. Cargar datos del triplestore
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
        String queryString = "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }";
        Model model;
        try (RDFConnection conn = RDFConnection.connectPW(triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {
            try (QueryExecution qexec = conn.query(queryString)) {
                model = qexec.execConstruct();
            }
        }
        return model;
    }

    private List<Rule> loadRules() {
        // Cargando archivo de reglas usando springboot resouceLoader
        try{
        Resource rulesResource = resourceLoader.getResource("classpath:" + rulesFileName);
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

        // Guardar las inferencias en el triplestore
        try (RDFConnection conn = RDFConnection.connectPW(triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {
            conn.load(newInferences); // Cargar el modelo de inferencias en el triplestore
            log.info("Inferences added: {}", countInferences );
        } catch (Exception e) {
            log.error("Error storing inferences: {}", e.getMessage());
        }
    }

}