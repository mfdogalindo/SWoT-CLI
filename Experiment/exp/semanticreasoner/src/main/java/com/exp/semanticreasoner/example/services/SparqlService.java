package com.exp.semanticreasoner.example.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SparqlService {

    @Value("${TRIPLESTORE_URL:http://localhost:3030}")
    private String triplestoreEndpoint;

    @Value("${TRIPLESTORE_DATASET:swot}")
    private String triplestoreDataset;

    @Value("${TRIPLESTORE_USERNAME}")
    private String triplestoreUsername;

    @Value("${TRIPLESTORE_PASSWORD}")
    private String triplestorePassword;

    /**
     * Ejecuta una consulta SELECT y devuelve los resultados
     */
    public JsonNode executeSelect(String queryString) {
        try (RDFConnection conn = RDFConnection.connectPW(
                triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {

            // Ejecutar consulta SELECT
            QueryExecution qexec = conn.query(queryString);
            ResultSet results = qexec.execSelect();

            // Convertir ResultSet a JsonNode
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ResultSetFormatter.outputAsJSON(outputStream, results);

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(outputStream.toString());

        } catch (Exception e) {
            log.error("Error executing SELECT query: {}", e.getMessage());
            throw new RuntimeException("Error executing SELECT query", e);
        }
    }

    /**
     * Ejecuta una consulta INSERT
     */
    public void executeInsert(String updateString) {
        try (RDFConnection conn = RDFConnection.connectPW(
                triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {

            conn.update(updateString);
            log.info("INSERT operation completed successfully");

        } catch (Exception e) {
            log.error("Error executing INSERT operation: {}", e.getMessage());
            throw new RuntimeException("Error executing INSERT operation", e);
        }
    }

    /**
     * Ejecuta una consulta UPDATE
     */
    public void executeUpdate(String updateString) {
        try (RDFConnection conn = RDFConnection.connectPW(
                triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {

            conn.update(updateString);
            log.info("UPDATE operation completed successfully");

        } catch (Exception e) {
            log.error("Error executing UPDATE operation: {}", e.getMessage());
            throw new RuntimeException("Error executing UPDATE operation", e);
        }
    }

    /**
     * Ejecuta una consulta DELETE
     */
    public void executeDelete(String updateString) {
        try (RDFConnection conn = RDFConnection.connectPW(
                triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {

            conn.update(updateString);
            log.info("DELETE operation completed successfully");

        } catch (Exception e) {
            log.error("Error executing DELETE operation: {}", e.getMessage());
            throw new RuntimeException("Error executing DELETE operation", e);
        }
    }

    /**
     * Ejecuta una consulta CONSTRUCT y devuelve el Model
     */
    public Model executeConstruct(String queryString) {
        try (RDFConnection conn = RDFConnection.connectPW(
                triplestoreEndpoint + "/" + triplestoreDataset,
                triplestoreUsername, triplestorePassword)) {

            return conn.queryConstruct(queryString);

        } catch (Exception e) {
            log.error("Error executing CONSTRUCT query: {}", e.getMessage());
            throw new RuntimeException("Error executing CONSTRUCT query", e);
        }
    }
}
