package PackagePlaceHolder.demo.repositories;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class ExampleRepository {

    @Value("${TRIPLESTORE_URL:http://localhost:3030}")
    private String triplestoreEndpoint;

    @Value("${TRIPLESTORE_DATASET:swot}")
    private String triplestoreDataset;

    @Value("${TRIPLESTORE_USERNAME")
    private String triplestoreUsername;

    @Value("${TRIPLESTORE_PASSWORD}")
    private String triplestorePassword;

    private RDFConnection conn;


    public Model queryModel(String query) {
        connectToTriplestore();
        try(QueryExecution qExec = conn.query(query)) {
            return qExec.execConstruct();
        } catch (Exception e) {
            log.error("Error querying triplestore: {}", e.getMessage());
            return null;
        }
        finally {
            closeConnection();
        }
    }

    public void loadModel(Model model) {
        connectToTriplestore();
        try {
            conn.load(model);
        } catch (Exception e) {
            log.error("Error loading model into triplestore: {}", e.getMessage());
        }
        finally {
            closeConnection();
        }
    }

    public List<QuerySolution> queryResultSet(String query) {
        connectToTriplestore();
        List<QuerySolution> solutions = new ArrayList<>();
        try(QueryExecution qExec = conn.query(query)) {
            ResultSet results = qExec.execSelect();
            while (results.hasNext()) {
                solutions.add(results.nextSolution());
            }
        } catch (Exception e) {
            log.error("Error querying triplestore: {}", e.getMessage());
        }
        finally {
            closeConnection();
        }
        return solutions;
    }


    private void connectToTriplestore() {
        if(conn == null || conn.isClosed() || !conn.queryAsk("ASK{}")) {
            conn = RDFConnection.connectPW(triplestoreEndpoint + "/" + triplestoreDataset, triplestoreUsername, triplestorePassword);
        }
    }


    private void closeConnection() {
        if(conn != null) {
            conn.close();
        }
    }

}
