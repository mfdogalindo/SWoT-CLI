package PackagePlaceHolder.demo.services;

import PackagePlaceHolder.demo.exceptions.InvalidQueryException;
import java.util.Set;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QueryParseException;
import org.apache.jena.update.UpdateFactory;
import org.springframework.stereotype.Component;

@Component
public class SparqlSanitizer {

    private static final Set<String> FORBIDDEN_KEYWORDS = Set.of(
        "LOAD", "CLEAR", "DROP", "CREATE", "DELETE", "INSERT"
    );

    /**
     * Sanitiza y valida una consulta SPARQL SELECT
     */
    public String sanitizeSelect(String query) throws InvalidQueryException {
        try {
            // Validar sintaxis
            QueryFactory.create(query);

            // Verificar que es una consulta SELECT
            if (!query.trim().toUpperCase().startsWith("SELECT")) {
                throw new InvalidQueryException("Only SELECT queries are allowed in this endpoint");
            }

            // Verificar palabras prohibidas
            for (String keyword : FORBIDDEN_KEYWORDS) {
                if (query.toUpperCase().contains(keyword)) {
                    throw new InvalidQueryException("Forbidden keyword found: " + keyword);
                }
            }

            // Limpieza básica
            return query.trim();

        } catch (QueryParseException e) {
            throw new InvalidQueryException("Invalid SPARQL syntax: " + e.getMessage());
        }
    }

    /**
     * Sanitiza y valida una consulta SPARQL UPDATE
     */
    public String sanitizeUpdate(String query) throws InvalidQueryException {
        try {
            // Validar sintaxis
            UpdateFactory.create(query);

            // Verificar que es una actualización válida
            if (!query.trim().toUpperCase().contains("INSERT") &&
                !query.trim().toUpperCase().contains("DELETE")) {
                throw new InvalidQueryException("Invalid UPDATE query");
            }

            // Validar que no contenga operaciones peligrosas
            if (query.toUpperCase().contains("DROP") ||
                query.toUpperCase().contains("CLEAR") ||
                query.toUpperCase().contains("LOAD")) {
                throw new InvalidQueryException("Dangerous operations are not allowed");
            }

            return query.trim();

        } catch (QueryParseException e) {
            throw new InvalidQueryException("Invalid SPARQL syntax: " + e.getMessage());
        }
    }
}
