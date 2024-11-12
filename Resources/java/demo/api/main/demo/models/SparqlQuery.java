package PackagePlaceHolder.demo.models;

import lombok.Data;

import java.util.Map;

/**
 * DTO para las consultas SPARQL
 */
@Data
public class SparqlQuery {
    private String query;
    private Map<String, String> parameters;
}
