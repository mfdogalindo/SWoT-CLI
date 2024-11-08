package PackagePlaceHolder.demo.controller;

import PackagePlaceHolder.demo.exceptions.InvalidQueryException;
import PackagePlaceHolder.demo.services.SparqlService;
import PackagePlaceHolder.demo.models.SparqlQuery;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/sparql")
public class SparqlController {

   @Autowired
   SparqlService sparqlService;


    /**
     * Endpoint para consultas SELECT
     */
    @PostMapping("/select")
    public ResponseEntity<JsonNode> select(@RequestBody SparqlQuery query) {
        try {
            JsonNode results = sparqlService.executeSelect(query.getQuery());
            return ResponseEntity.ok(results);
        } catch (InvalidQueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Endpoint para consultas INSERT
     */
    @PostMapping("/insert")
    public ResponseEntity<Void> insert(@RequestBody SparqlQuery query) {
        try {
            sparqlService.executeInsert(query.getQuery());
            return ResponseEntity.ok().build();
        } catch (InvalidQueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Endpoint para consultas UPDATE
     */
    @PutMapping("/update")
    public ResponseEntity<Void> update(@RequestBody SparqlQuery query) {
        try {
            sparqlService.executeUpdate(query.getQuery());
            return ResponseEntity.ok().build();
        } catch (InvalidQueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Endpoint para consultas DELETE
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> delete(@RequestBody SparqlQuery query) {
        try {
            sparqlService.executeDelete(query.getQuery());
            return ResponseEntity.ok().build();
        } catch (InvalidQueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
