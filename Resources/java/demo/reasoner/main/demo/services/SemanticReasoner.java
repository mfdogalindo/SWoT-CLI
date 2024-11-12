package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.repositories.ExampleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.*;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.apache.jena.vocabulary.RDF;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class SemanticReasoner {

    @Autowired
    org.springframework.core.io.ResourceLoader resourceLoader;

    @Autowired
    private ExampleRepository repository;

    @Value("${RULES_FILE:rules.txt}")
    private String rulesFileName;

    @Value("${SWOT_URL_PREFIX}")
    private String appUrlPrefix;

    private Long elapsedTime;

    private static final String SOSA_NS = "http://www.w3.org/ns/sosa/";
    private static final String INFERENCE_SUFFIX = "inference#";
    private static final String ALERT_SUFFIX = "alert#";

    public void performReasoning() {
        // 1. Cargar observaciones no procesadas del triplestore
        elapsedTime = System.currentTimeMillis();
        Model data = loadDataFromTriplestore();

        if(data == null || data.isEmpty()) {
            log.info("No observations to process - Elapsed time: {}ms", System.currentTimeMillis() - elapsedTime);
            return;
        }

        // 2. Cargar y procesar reglas
        List<Rule> rules = loadRules();
        GenericRuleReasoner reasoner = new GenericRuleReasoner(rules);
        reasoner.setMode(GenericRuleReasoner.FORWARD_RETE);

        // 3. Crear modelo de inferencia y ejecutar reglas
        InfModel infModel = ModelFactory.createInfModel(reasoner, data);

        // 4. Extraer las inferencias generadas
        Model newInferences = ModelFactory.createDefaultModel();
        extractInferences(infModel, newInferences);

        // 5. Marcar observaciones como procesadas y almacenar
        storeInferencesAndMarkProcessed(data, newInferences);
    }

    private Model loadDataFromTriplestore() {
        // Obteniendo datos del triplestore de observaciones que no han sido inferidas
        String queryString = String.format("""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX inference: <%s>

            CONSTRUCT {
                ?observation ?p ?o .
                ?result ?p2 ?o2 .
            }
            WHERE {
                ?observation rdf:type sosa:Observation ;
                            ?p ?o .
                OPTIONAL {
                    ?observation sosa:hasResult ?result .
                    ?result ?p2 ?o2 .
                }
                FILTER NOT EXISTS { ?observation inference:processed true }
            }
            """, appUrlPrefix + INFERENCE_SUFFIX);
        log.debug("Querying data from triplestore: \n{}", queryString);
        return repository.queryModel(queryString);
    }

    private List<Rule> loadRules() {
        try {
            // 1. Cargar el archivo de reglas
            org.springframework.core.io.Resource rulesResource = resourceLoader.getResource("classpath:" + rulesFileName);

            // 2. Leer el contenido del archivo como String
            String rulesContent;
            try (Reader reader = new InputStreamReader(rulesResource.getInputStream(), StandardCharsets.UTF_8)) {
                rulesContent = FileCopyUtils.copyToString(reader);
            }

            // 3. Reemplazar los placeholders con el prefijo dinámico
            String processedRules = rulesContent
                .replace("%salert#", appUrlPrefix + ALERT_SUFFIX)
                .replace("%sinference#", appUrlPrefix + INFERENCE_SUFFIX);

            log.debug("Processed rules content: \n{}", processedRules);

            // 4. Parsear las reglas procesadas
            return Rule.parseRules(processedRules);

        } catch (IOException e) {
            log.error("Error loading rules file: {}", e.getMessage());
            throw new RuntimeException("Error loading rules: " + e.getMessage(), e);
        } catch (Rule.ParserException e) {
            log.error("Error parsing rules: {}", e.getMessage());
            throw new RuntimeException("Error parsing rules: " + e.getMessage(), e);
        }
    }

    /**
     * Extrae las inferencias generadas por el razonador
     */
    private void extractInferences(InfModel infModel, Model newInferences) {
        StmtIterator alertStmts = infModel.listStatements(
                null,
                infModel.createProperty(appUrlPrefix + "alert#hasAlert"),
                (RDFNode) null
        );

        while (alertStmts.hasNext()) {
            Statement alertStmt = alertStmts.next();
            Resource observation = alertStmt.getSubject();

            // Agregar la alerta y sus propiedades
            newInferences.add(alertStmt);

            // Agregar severidad y mensaje
            Statement severityStmt = infModel.getProperty(
                    observation,
                    infModel.createProperty(appUrlPrefix + "alert#severity")
            );
            Statement messageStmt = infModel.getProperty(
                    observation,
                    infModel.createProperty(appUrlPrefix + "alert#message")
            );

            if (severityStmt != null) newInferences.add(severityStmt);
            if (messageStmt != null) newInferences.add(messageStmt);
        }
    }

    /**
     * Almacena las inferencias y marca las observaciones como procesadas
     */
    private void storeInferencesAndMarkProcessed(Model data, Model newInferences) {
        // Crear modelo para marcar observaciones como procesadas
        Model processedMarks = ModelFactory.createDefaultModel();

        // Obtener TODAS las observaciones del modelo de datos original
        ResIterator observations = data.listSubjects();

        while (observations.hasNext()) {
            Resource observation = observations.nextResource();
            // Verificar si es una observación
            if (observation.hasProperty(RDF.type, ResourceFactory.createResource(SOSA_NS + "Observation"))) {
                processedMarks.add(
                    observation,
                    ResourceFactory.createProperty(appUrlPrefix + "inference#processed"),
                    ResourceFactory.createTypedLiteral(true)
                );
            }
        }

        // Guardar todo en el triplestore
        if (newInferences.size() > 0) {
            repository.loadModel(newInferences);
        }
        repository.loadModel(processedMarks);

        log.info("Processed {} observations (with {} inferences) - Elapsed time: {}ms",
                processedMarks.size(),
                newInferences.size(),
                System.currentTimeMillis() - elapsedTime);
    }
}