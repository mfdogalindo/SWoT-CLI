package com.exp.semanticreasoner.example.services;

import com.exp.semanticreasoner.example.repositories.ExampleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.apache.jena.vocabulary.RDF;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Slf4j
@Component
public class SemanticReasoner {

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    private ExampleRepository repository;

    @Value("${RULES_FILE:rules.txt}")
    private String rulesFileName;

    private RDFConnection rdfConnection;

    private static final String BASE_URI = "http://example.org/swot/";
    private static final String SOSA_NS = "http://www.w3.org/ns/sosa/";
    private static final Property PROCESSED_PROPERTY =
            ResourceFactory.createProperty(BASE_URI + "processed");

    // Prefijos SPARQL comunes
    private static final String COMMON_PREFIXES = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX ssn: <http://www.w3.org/ns/ssn/>
        PREFIX swot: <http://example.org/swot/>
        PREFIX qudt: <http://qudt.org/schema/qudt/>
        PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
        """;

    public void performReasoning() {
        log.info("Starting reasoning process...");
        long elapsedTime = System.currentTimeMillis();

        rdfConnection = repository.getConn();

        // Usar transacción de RDFConnection
        rdfConnection.begin(ReadWrite.WRITE);
        try {
            // 1. Cargar datos no procesados
            Model dataModel = loadUnprocessedData();

            if (dataModel.isEmpty()) {
                log.info("No unprocessed observations found");
                return;
            }

            log.info("Found {} unprocessed statements", dataModel.size());

            // 2. Cargar reglas y crear razonador
            List<Rule> rules = loadRules();
            Reasoner reasoner = new GenericRuleReasoner(rules);
            reasoner.setDerivationLogging(true);

            // 3. Crear modelo de inferencia
            InfModel infModel = ModelFactory.createInfModel(reasoner, dataModel);

            // 4. Procesar inferencias y actualizar
            processInferencesAndUpdate(infModel, dataModel);

            rdfConnection.commit();

            elapsedTime = System.currentTimeMillis() - elapsedTime;
            log.info("Reasoning process completed in {} ms", elapsedTime);

        } catch (Exception e) {
            rdfConnection.abort();
            log.error("Error during reasoning process: {}", e.getMessage(), e);
            throw new RuntimeException("Reasoning process failed", e);
        } finally {
            rdfConnection.abort();
            rdfConnection.end();
        }
    }


    private Model loadUnprocessedData() {
        String queryString = COMMON_PREFIXES + """
            CONSTRUCT {
                ?observation ?p ?o .
                ?result ?rp ?ro .
                ?sensor ?sp ?so .
            }
            WHERE {
                ?observation a sosa:Observation ;
                            swot:processed false .
                ?observation ?p ?o .
                OPTIONAL {
                    ?observation sosa:hasResult ?result .
                    ?result ?rp ?ro .
                }
                OPTIONAL {
                    ?observation sosa:madeBySensor ?sensor .
                    ?sensor ?sp ?so .
                }
            }
        """;

        return rdfConnection.queryConstruct(queryString);
    }

    private void processInferencesAndUpdate(InfModel infModel, Model dataModel) {
        ResIterator observationIterator = dataModel.listSubjectsWithProperty(
                RDF.type,
                ResourceFactory.createResource(SOSA_NS + "Observation")
        );

        try {
            while (observationIterator.hasNext()) {
                Resource observation = observationIterator.nextResource();

                // Buscar inferencias para esta observación
                StmtIterator inferenceStmts = infModel.listStatements(
                        observation, null, (RDFNode)null
                );

                // Procesar y almacenar cada inferencia
                while (inferenceStmts.hasNext()) {
                    Statement stmt = inferenceStmts.next();
                    storeNewInference(stmt);
                    logInference(observation, stmt);
                }
                inferenceStmts.close();

                // Marcar como procesada
                updateObservationStatus(observation);
            }
        } finally {
            observationIterator.close();
        }
    }

    private void storeNewInference(Statement stmt) {
        // Almacenar nueva inferencia usando UPDATE
        String updateQuery = COMMON_PREFIXES + String.format("""
                INSERT DATA {
                    <%s> <%s> %s
                }
                """,
                stmt.getSubject().getURI(),
                stmt.getPredicate().getURI(),
                stmt.getObject().isLiteral() ?
                        stmt.getLiteral().toString() :
                        "<" + stmt.getObject().toString() + ">"
        );

        rdfConnection.update(updateQuery);

    }

    private void updateObservationStatus(Resource observation) {
        String updateQuery = COMMON_PREFIXES + String.format("""
            DELETE {
                <%s> swot:processed ?oldStatus
            }
            INSERT {
                <%s> swot:processed true
            }
            WHERE {
                OPTIONAL { <%s> swot:processed ?oldStatus }
            }
            """,
                observation.getURI(),
                observation.getURI(),
                observation.getURI()
        );

        rdfConnection.update(updateQuery);
        log.debug("Marked observation {} as processed", observation.getURI());
    }

    private void logInference(Resource observation, Statement inference) {
        if (!inference.getPredicate().equals(PROCESSED_PROPERTY)) {
            log.debug("New inference for observation {}: {} {} {}",
                    observation.getURI(),
                    inference.getPredicate().getLocalName(),
                    inference.getObject().toString());
        }
    }

    private List<Rule> loadRules() throws IOException {
        org.springframework.core.io.Resource rulesResource =
                resourceLoader.getResource("classpath:" + rulesFileName);
        try {
            List<Rule> rules = Rule.rulesFromURL(rulesResource.getURL().toString());
            log.debug("Loaded {} inference rules", rules.size());
            return rules;
        } catch (IOException e) {
            log.error("Error loading rules file: {}", e.getMessage());
            throw e;
        }
    }

}

