package PackagePlaceHolder.demo.exceptions;

// Excepción personalizada para errores de consulta al triplestore
public class TripleStoreQueryException extends RuntimeException {
    public TripleStoreQueryException(String message, Throwable cause) {
        super(message, cause);
    }
}
