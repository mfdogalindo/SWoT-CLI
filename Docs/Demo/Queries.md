
Obtener temperaturas medidas por los nodos
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX qudt: <http://qudt.org/schema/qudt#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX iotlite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#>

SELECT DISTINCT ?nodeId ?zone ?value ?timestamp
WHERE {
# Obtener información del nodo
?node rdf:type iotlite:Device ;
iotlite:hasZone ?zone .

    # Extraer el ID del nodo de forma consistente
    BIND(REPLACE(str(?node), "^.*/node/", "") as ?nodeId)
    
    # Obtener el sensor de temperatura y su observación
    ?sensor rdf:type sosa:Sensor ;
            sosa:isHostedBy ?node .
            
    # Asegurarse que es un sensor de temperatura
    FILTER(STRENDS(STR(?sensor), "-T"))
    
    # Obtener la observación única usando su URI específica
    ?observation rdf:type sosa:Observation ;
                sosa:hasFeatureOfInterest ?sensor ;
                sosa:observedProperty sosa:Temperature ;
                sosa:resultTime ?timestamp ;
                sosa:hasResult ?quantityValue .
    
    # Obtener el valor numérico
    ?quantityValue qudt:numericValue ?value .
}
ORDER BY ?nodeId ?timestamp
```