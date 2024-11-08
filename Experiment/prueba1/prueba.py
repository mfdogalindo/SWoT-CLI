from rdflib import Graph, Literal, RDF, URIRef, Namespace
from rdflib.namespace import XSD, RDFS
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import time

# Definir namespaces
SMARTCITY = Namespace("http://example.org/smartcity/")
SOSA = Namespace("http://www.w3.org/ns/sosa/")
SSN = Namespace("http://www.w3.org/ns/ssn/")

# Inicializar el grafo RDF
g = Graph()
g.bind("smartcity", SMARTCITY)
g.bind("sosa", SOSA)
g.bind("ssn", SSN)

# Función para convertir timestamp a formato ISO
def format_timestamp(ts):
    return datetime.fromtimestamp(ts/1000.0).isoformat()

# Función para procesar los datos y convertirlos a RDF
def process_sensor_data(data):
    sensor_uri = URIRef(SMARTCITY[f"sensor-{data['id']}"])
    observation_uri = URIRef(SMARTCITY[f"observation-{data['id']}-{data['timestamp']}"])

    # Añadir triples básicos del sensor
    g.add((sensor_uri, RDF.type, SOSA.Sensor))
    g.add((sensor_uri, SMARTCITY.zone, Literal(data['zone'])))
    g.add((sensor_uri, SMARTCITY.latitude, Literal(data['latitude'], datatype=XSD.decimal)))
    g.add((sensor_uri, SMARTCITY.longitude, Literal(data['longitude'], datatype=XSD.decimal)))

    # Añadir observación
    g.add((observation_uri, RDF.type, SOSA.Observation))
    g.add((observation_uri, SOSA.madeBySensor, sensor_uri))
    g.add((observation_uri, SOSA.resultTime, Literal(format_timestamp(data['timestamp']), datatype=XSD.dateTime)))

    # Añadir valores de los sensores
    g.add((observation_uri, SMARTCITY.temperature, Literal(data['temperature'], datatype=XSD.decimal)))
    g.add((observation_uri, SMARTCITY.humidity, Literal(data['humidity'], datatype=XSD.decimal)))
    g.add((observation_uri, SMARTCITY.airQuality, Literal(data['airQuality'], datatype=XSD.decimal)))
    g.add((observation_uri, SMARTCITY.noiseLevel, Literal(data['noiseLevel'], datatype=XSD.decimal)))

    # Detectar eventos críticos usando SPARQL
    check_critical_events(observation_uri)

def check_critical_events(observation_uri):
    # Consulta SPARQL para detectar eventos críticos
    query = """
    PREFIX smartcity: <http://example.org/smartcity/>
    PREFIX sosa: <http://www.w3.org/ns/sosa/>

    SELECT ?sensor ?temp ?noise ?air WHERE {
        ?observation smartcity:temperature ?temp ;
                    smartcity:noiseLevel ?noise ;
                    smartcity:airQuality ?air ;
                    sosa:madeBySensor ?sensor .
        FILTER(?temp > 35 || ?noise > 85 || ?air > 150)
    }
    """

    results = g.query(query)
    for row in results:
        if float(row.temp) > 35:
            print(f"¡ALERTA! Temperatura alta ({row.temp}°C) detectada en sensor {row.sensor}")
        if float(row.noise) > 85:
            print(f"¡ALERTA! Nivel de ruido alto ({row.noise} dB) detectado en sensor {row.sensor}")
        if float(row.air) > 150:
            print(f"¡ALERTA! Mala calidad del aire ({row.air}) detectada en sensor {row.sensor}")

# Configuración MQTT
def on_connect(client, userdata, flags, rc):
    print("Conectado al broker MQTT")
    client.subscribe("smartcity")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        process_sensor_data(data)

        # Guardar el grafo RDF periódicamente (cada 100 mensajes)
        if len(g) % 100 == 0:
            g.serialize("smartcity_data.ttl", format="turtle")

    except Exception as e:
        print(f"Error procesando mensaje: {e}")

# Iniciar cliente MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Conectar al broker MQTT (ajusta los parámetros según tu configuración)
client.connect("localhost", 1883, 60)

# Iniciar loop
client.loop_forever()
