package com.exp.semanticreasoner.example.services;

final public class EnvironmentalQueries {
   // Consulta SPARQL para obtener alertas de temperatura
   final static public String TEMPERATURE_OBSERVATIONS = """
            PREFIX unit: <http://qudt.org/vocab/unit/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt/>
            prefix swot: <http://example.org/swot/>
         
            SELECT ?observationId ?sensorId ?value ?unit ?time ?htAlert ?ltAlert
            WHERE {
                ?observationId rdf:type sosa:Observation;
                               sosa:madeBySensor ?sensorId ;
                               sosa:resultTime ?time;
                               sosa:hasResult ?result.
           
                ?result qudt:numericValue ?value;
                        qudt:unit  qudt:DegreeCelsius;
            
                OPTIONAL { ?observationId swot:highTemperatureAlert ?htAlert }
                OPTIONAL { ?observationId swot:lowTemperatureAlert ?ltAlert }      
                       
                BIND(qudt:DegreeCelsius AS ?unit)       
            } ORDER BY DESC(?time)
            """;

   // Consulta SPARQL para alertas de calidad del aire
   final static public String AIR_QUALITY_OBSERVATIONS = """
            PREFIX unit: <http://qudt.org/vocab/unit/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt/>
            prefix swot: <http://example.org/swot/>
         
            SELECT ?observationId ?sensorId ?value ?unit ?time ?alert
            WHERE {
                ?observationId rdf:type sosa:Observation;
                               sosa:madeBySensor ?sensorId ;
                               sosa:resultTime ?time;
                               sosa:hasResult ?result.
           
                ?result qudt:numericValue ?value;
                        qudt:unit  qudt:AQI;
            
                OPTIONAL { ?observationId swot:airQualityAlert ?alert }        
                       
                BIND(qudt:AQI AS ?unit)       
            } ORDER BY DESC(?time)
            """;

   // Consulta SPARQL para obtener alertas de ruido
   final static public String NOISE_OBSERVATIONS = """
            PREFIX unit: <http://qudt.org/vocab/unit/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt/>
            prefix swot: <http://example.org/swot/>
         
            SELECT ?observationId ?sensorId ?value ?unit ?time ?alert
            WHERE {
                ?observationId rdf:type sosa:Observation;
                               sosa:madeBySensor ?sensorId ;
                               sosa:resultTime ?time;
                               sosa:hasResult ?result.
           
                ?result qudt:numericValue ?value;
                        qudt:unit  qudt:Decibel;
            
                OPTIONAL { ?observationId swot:NoiseAlert ?alert }        
                       
                BIND(qudt:Decibel AS ?unit)       
            } ORDER BY DESC(?time)
            """;

   // Consulta SPARQL para obtener todas las observaciones
   final static public String OBSERVATIONS = """
            PREFIX unit: <http://qudt.org/vocab/unit/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt/>
            prefix swot: <http://example.org/swot/>
         
            SELECT ?observationId ?sensorId ?value ?unit ?time 
            WHERE {
                ?observationId rdf:type sosa:Observation;
                               sosa:madeBySensor ?sensorId ;
                               sosa:resultTime ?time;
                               sosa:hasResult ?result.
           
                ?result qudt:numericValue ?value;
                        qudt:unit  ?unit;    
                           
            } ORDER BY DESC(?time)
            """;

}
