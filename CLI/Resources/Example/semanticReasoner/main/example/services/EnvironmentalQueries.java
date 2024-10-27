package PackagePlaceHolder.example.services;

final public class EnvironmentalQueries {
   // Consulta SPARQL para obtener alertas de temperatura
   final static public String TEMPERATURE_ALERTS = """
                   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                   PREFIX sosa: <http://www.w3.org/ns/sosa/>
                   PREFIX swot: <http://example.org/swot/property/>
                   PREFIX inference: <http://example.org/swot/inference/>
                   PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
               
                   SELECT ?observationId ?sensorId ?temperature ?alertLevel ?timestamp
                   WHERE {
                       ?observationId rdf:type sosa:Observation ;
                                     sosa:madeBySensor ?sensorId ;
                                     sosa:observedProperty swot:temperature ;
                                     sosa:hasSimpleResult ?temperature ;
                                     sosa:resultTime ?timestamp ;
                                     inference:temperatureAlert ?alertLevel .
               
                       # Filtrar solo las alertas recientes (últimas 24 horas)
                       FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                   }
                   ORDER BY DESC(?timestamp)
               """;
   // Consulta SPARQL para
   // obtener estados de calidad del aire
   final static public String AIR_QUALITY_STATUS = """
                   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                   PREFIX sosa: <http://www.w3.org/ns/sosa/>
                   PREFIX swot: <http://example.org/swot/property/>
                   PREFIX inference: <http://example.org/swot/inference/>
                   PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
               
                   SELECT ?observationId ?sensorId ?airQuality ?status ?timestamp
                   WHERE {
                       ?observationId rdf:type sosa:Observation ;
                                     sosa:madeBySensor ?sensorId ;
                                     sosa:observedProperty swot:airQuality ;
                                     sosa:hasSimpleResult ?airQuality ;
                                     sosa:resultTime ?timestamp ;
                                     inference:airQualityStatus ?status .
               
                       # Filtrar solo los estados recientes (últimas 24 horas)
                       FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
                   }
                   ORDER BY DESC(?timestamp)
               """;

   // Consulta SPARQL para obtener niveles de confort
   final static public String COMFORT_STATUS = """
               PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
               PREFIX sosa: <http://www.w3.org/ns/sosa/>
               PREFIX swot: <http://example.org/swot/property/>
               PREFIX inference: <http://example.org/swot/inference/>
               PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
               
               SELECT ?tempObservation ?sensorId ?temperatureValue ?humidityValue ?comfortLevel ?timestamp\s
               WHERE {
                   # Obtener observación de temperatura
                   ?tempObservation rdf:type sosa:Observation ;
                                   sosa:madeBySensor ?sensorId ;
                                   sosa:observedProperty swot:temperature ;
                                   sosa:hasSimpleResult ?temperatureValue ;
                                   sosa:resultTime ?timestamp ;
                                inference:comfortLevel ?comfortLevel .
               
                   # Obtener observación de humedad para el mismo sensor y timestamp
                   ?humidityObservation rdf:type sosa:Observation ;
                                        sosa:madeBySensor ?sensorId ;
                                        sosa:observedProperty swot:humidity ;
                                        sosa:hasSimpleResult ?humidityValue ;
                                        sosa:resultTime ?timestamp .
               
                   # Filtrar solo las observaciones recientes
                   FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
               }
               ORDER BY DESC(?timestamp)
               """;

   // Consulta SPARQL para obtener estados de humedad
    final static public String HUMIDITY_STATUS = """
               PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
               PREFIX sosa: <http://www.w3.org/ns/sosa/>
               PREFIX swot: <http://example.org/swot/property/>
               PREFIX inference: <http://example.org/swot/inference/>
               PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
               
               SELECT ?observationId ?sensorId ?humidity ?status ?timestamp
               WHERE {
                   ?observationId rdf:type sosa:Observation ;
                                 sosa:madeBySensor ?sensorId ;
                                 sosa:observedProperty swot:humidity ;
                                 sosa:hasSimpleResult ?humidity ;
                                 sosa:resultTime ?timestamp ;
                                 inference:humidityLevel ?status .
               
                   # Filtrar solo los estados recientes (últimas 24 horas)
                   FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
               }
               ORDER BY DESC(?timestamp)
               """;

   // Consulta SPARQL para obtener observaciones
   final static public String OBSERVATIONS = """
               PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
               PREFIX sosa: <http://www.w3.org/ns/sosa/>
               PREFIX swot: <http://example.org/swot/property/>
               PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
               SELECT ?id ?sensorId ?timestamp ?observedProperty ?result ?unit
               WHERE {
                   ?id rdf:type sosa:Observation ;
                       sosa:madeBySensor ?sensorId ;
                       sosa:hasUnit ?unit;
                       sosa:observedProperty ?observedProperty ;
                       sosa:hasSimpleResult ?result ;
                       sosa:resultTime ?timestamp .
          
                   # Filtrar solo las observaciones recientes (últimas 24 horas)
                   FILTER (?timestamp >= NOW() - "P1D"^^xsd:duration)
          
               }
               ORDER BY DESC(?timestamp)
               """;
}
