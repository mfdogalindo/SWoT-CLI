# 6. Modelo Semántico

## 6.1 Ontologías Base

### 6.1.1 SSN/SOSA
```turtle
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix ssn: <http://www.w3.org/ns/ssn/> .

# Definición de sensor
<sensor/NODE-001> a sosa:Sensor ;
    ssn:implements <procedure/temperature-sensing> ;
    sosa:observes <property/temperature> .

# Definición de observación
<observation/NODE-001/temp/1699696530000> a sosa:Observation ;
    sosa:madeBySensor <sensor/NODE-001> ;
    sosa:observedProperty <property/temperature> ;
    sosa:hasResult [
        a qudt:QuantityValue ;
        qudt:numericValue "25.5"^^xsd:decimal ;
        qudt:unit unit:DegreeCelsius
    ] ;
    sosa:resultTime "2024-11-11T10:15:30Z"^^xsd:dateTime .
```

### 6.1.2 IoT-Lite
```turtle
@prefix iot-lite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

# Definición de dispositivo
<device/NODE-001> a iot-lite:Device ;
    iot-lite:hasLocation [
        a geo:Point ;
        geo:lat "2.4422"^^xsd:decimal ;
        geo:long "-76.6122"^^xsd:decimal
    ] ;
    iot-lite:hasMetadata [
        a iot-lite:Metadata ;
        iot-lite:metadataType "zone" ;
        iot-lite:value "ZONE-NORTH"
    ] .
```

## 6.2 Reglas de Inferencia

### 6.2.1 Reglas para Alertas
```sparql
# Regla para alta temperatura
[highTemperature:
    (?obs rdf:type sosa:Observation)
    (?obs sosa:observedProperty sosa:Temperature)
    (?obs sosa:hasResult ?result)
    (?result qudt:numericValue ?value)
    greaterThan(?value, 35.0)
    ->
    (?obs alert:hasAlert "HighTemperature")
    (?obs alert:severity "WARNING")
    (?obs alert:message "Temperature exceeds normal range")
]
```

## 6.3 Consultas SPARQL Comunes

### 6.3.1 Consultas de Lecturas
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX qudt: <http://qudt.org/schema/qudt#>

SELECT ?sensor ?value ?time
WHERE {
    ?obs a sosa:Observation ;
         sosa:madeBySensor ?sensor ;
         sosa:hasResult ?result ;
         sosa:resultTime ?time .
    ?result qudt:numericValue ?value .
}
ORDER BY DESC(?time)
LIMIT 10
```
