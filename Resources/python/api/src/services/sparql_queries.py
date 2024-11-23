class SparqlQueries:
    COUNT_QUERY = """
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>

    SELECT (COUNT(DISTINCT ?observation) as ?count)
    WHERE {
        ?sensor rdf:type sosa:Sensor .
        ?observation sosa:hasFeatureOfInterest ?sensor ;
                    sosa:observedProperty sosa:%s .
    }
    """

    BASE_QUERY = """
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX qudt: <http://qudt.org/schema/qudt#>
    PREFIX unit: <http://qudt.org/vocab/unit/>
    PREFIX inference: <%sinference#>
    PREFIX alert: <%salert#>

    SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?processed
    WHERE {
        ?sensor rdf:type sosa:Sensor .
        BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?sensorId)

        ?observation sosa:hasFeatureOfInterest ?sensor ;
                    sosa:observedProperty sosa:%s ;
                    sosa:resultTime ?timestamp ;
                    sosa:hasResult ?result .

        ?result qudt:numericValue ?value ;
                qudt:unit ?unitResource .

        BIND(REPLACE(str(?unitResource), "^.*/unit/", "") as ?unit)

        OPTIONAL {
            ?observation inference:processed ?processed .
        }
    }
    ORDER BY DESC(?timestamp)
    OFFSET %d
    LIMIT %d
    """

    SENSOR_DETAILS_QUERY = """
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX iotlite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX alert: <%salert#>

    SELECT DISTINCT ?id ?zone ?lat ?long
                  (COUNT(DISTINCT ?observation) as ?totalObs)
                  (COUNT(DISTINCT ?alert) as ?totalAlerts)
                  (MAX(?timestamp) as ?lastReading)
    WHERE {
        ?sensor rdf:type sosa:Sensor .
        BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?id)

        ?sensor sosa:isHostedBy ?node .

        OPTIONAL { ?node iotlite:hasZone ?zone }
        OPTIONAL { ?node geo:lat ?lat }
        OPTIONAL { ?node geo:long ?long }

        OPTIONAL {
            ?observation sosa:hasFeatureOfInterest ?sensor ;
                        sosa:resultTime ?timestamp .
        }

        OPTIONAL {
            ?observation alert:hasAlert ?alert
        }

        %s
    }
    GROUP BY ?sensor ?id ?zone ?lat ?long
    %s
    """

    # Consulta agregada para contar alertas
    COUNT_ALERTS_QUERY = """
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX alert: <%salert#>

    SELECT (COUNT(DISTINCT ?observation) as ?count)
    WHERE {
        ?sensor rdf:type sosa:Sensor .
        ?observation sosa:hasFeatureOfInterest ?sensor ;
                    sosa:observedProperty sosa:%s ;
                    alert:hasAlert ?alertType .
    }
    """

    READINGS_WITH_ALERTS_QUERY = """
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX qudt: <http://qudt.org/schema/qudt#>
    PREFIX unit: <http://qudt.org/vocab/unit/>
    PREFIX alert: <%salert#>

    SELECT DISTINCT ?sensorId ?value ?unit ?timestamp ?alertType ?severity ?message
    WHERE {
        # Obtener el sensor y su ID
        ?sensor rdf:type sosa:Sensor .
        BIND(REPLACE(str(?sensor), "^.*/sensor/", "") as ?sensorId)

        # Obtener la observación con su valor y timestamp
        ?observation sosa:hasFeatureOfInterest ?sensor ;
                    sosa:observedProperty sosa:%s ;
                    sosa:resultTime ?timestamp ;
                    sosa:hasResult ?result ;
                    # Requerir que tenga alerta
                    alert:hasAlert ?alertType ;
                    alert:severity ?severity ;
                    alert:message ?message .

        # Obtener el valor numérico y su unidad
        ?result qudt:numericValue ?value ;
                qudt:unit ?unitResource .

        # Extraer el nombre de la unidad de la URI
        BIND(REPLACE(str(?unitResource), "^.*/unit/", "") as ?unit)
    }
    ORDER BY DESC(?timestamp)
    OFFSET %d
    LIMIT %d
    """
