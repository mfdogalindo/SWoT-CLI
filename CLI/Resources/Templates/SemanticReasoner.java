package com.example.semanticreasoner;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.ReasonerRegistry;
import org.springframework.stereotype.Component;

@Component
public class SemanticReasoner {

    // Example method using Apache Jena Reasoner
    public Model performReasoning(Model inputModel) {
        Reasoner reasoner = ReasonerRegistry.getOWLReasoner();
        return ModelFactory.createInfModel(reasoner, inputModel);
    }
}