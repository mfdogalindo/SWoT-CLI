Obtener temperatura

```sparql

PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
        PREFIX ssn: <http://www.w3.org/ns/ssn/>
        PREFIX qudt: <http://qudt.org/schema/qudt/>
        PREFIX swot: <http://example.org/swot/>
        PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
        PREFIX unit: <http://qudt.org/vocab/unit/>

SELECT ?observationId ?sensorId  ?temperature 
            WHERE {
                # Obtener el sensor y su propiedad de temperatura
                ?observationId rdf:type sosa:Observation;
                               sosa:madeBySensor ?sensorId ;
                               sosa:hasResult ?result;
                               sosa:observedProperty qudt:Temperature .
  							?result qudt:numericValue ?temperature ;


                 }
ORDER BY DESC(?time)

```



# Regla para calidad del aire crítica (>150 AQI)
[DetectPoorAirQualityAlert:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 150.0)
  ->
  (?observation inference:alert "CRITICAL_AIR_QUALITY"^^xsd:string)
  (?observation inference:alertDescription "Air Quality Index exceeds critical threshold of 150"^^xsd:string)
  (?observation inference:alertLevel "HIGH"^^xsd:string)
]

# Regla para nivel de ruido crítico (>85 dB)
[DetectHighNoiseAlert:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:SoundPressureLevel)
  (?result qudt:numericValue ?noise)
  greaterThan(?noise, 85.0)
  ->
  (?observation inference:alert "CRITICAL_NOISE_LEVEL"^^xsd:string)
  (?observation inference:alertDescription "Noise level exceeds critical threshold of 85 dB"^^xsd:string)
  (?observation inference:alertLevel "HIGH"^^xsd:string)
]

# Reglas separadas para clasificar calidad del aire
[ClassifyAirQualityGood:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  lessThan(?aqi, 50)
  ->
  (?observation inference:airQualityLevel "GOOD"^^xsd:string)
]

[ClassifyAirQualityModerate:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 50)
  lessThan(?aqi, 100)
  ->
  (?observation inference:airQualityLevel "MODERATE"^^xsd:string)
]

[ClassifyAirQualityUnhealthySensitive:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 100)
  lessThan(?aqi, 150)
  ->
  (?observation inference:airQualityLevel "UNHEALTHY_SENSITIVE"^^xsd:string)
]

[ClassifyAirQualityUnhealthy:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 150)
  lessThan(?aqi, 200)
  ->
  (?observation inference:airQualityLevel "UNHEALTHY"^^xsd:string)
]

[ClassifyAirQualityVeryUnhealthy:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 200)
  lessThan(?aqi, 300)
  ->
  (?observation inference:airQualityLevel "VERY_UNHEALTHY"^^xsd:string)
]

[ClassifyAirQualityHazardous:
  (?observation rdf:type sosa:Observation)
  (?observation sosa:hasResult ?result)
  (?observation sosa:observedProperty qudt:AirQualityIndex)
  (?result qudt:numericValue ?aqi)
  greaterThan(?aqi, 300)
  ->
  (?observation inference:airQualityLevel "HAZARDOUS")
]
