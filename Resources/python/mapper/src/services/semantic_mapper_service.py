import logging
from datetime import datetime, timezone
from typing import Protocol

from config.settings import get_settings
from models.sensor_data import SensorNodeRecord
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF, XSD
from services.triple_store_service import TripleStoreProtocol


class SemanticMapperProtocol(Protocol):
    def map_sensor_data_to_rdf(self, data: SensorNodeRecord) -> None:
        ...


class SemanticMapperService:
    def __init__(self, triple_store_service: TripleStoreProtocol):
        self._settings = get_settings()
        self._triple_store = triple_store_service
        self._setup_namespaces()
        self.logger = logging.getLogger(__name__)
        self.logger.info("Semantic mapper service initialized")

    def _setup_namespaces(self) -> None:
        """Initialize RDF namespaces."""
        self.graph = Graph()

        # Define namespaces
        self.SOSA = Namespace("http://www.w3.org/ns/sosa/")
        self.SSN = Namespace("http://www.w3.org/ns/ssn/")
        self.IOTLITE = Namespace("http://purl.oclc.org/NET/UNIS/fiware/iot-lite#")
        self.GEO = Namespace("http://www.w3.org/2003/01/geo/wgs84_pos#")
        self.QUDT = Namespace("http://qudt.org/schema/qudt#")
        self.UNIT = Namespace("http://qudt.org/vocab/unit/")

        # Bind prefixes
        self.graph.bind("sosa", self.SOSA)
        self.graph.bind("ssn", self.SSN)
        self.graph.bind("iotlite", self.IOTLITE)
        self.graph.bind("geo", self.GEO)
        self.graph.bind("qudt", self.QUDT)

    def _create_sensor_observation(
            self,
            node: URIRef,
            sensor_id: str,
            sensor_type: str,
            value: float,
            unit_uri: str,
            timestamp: int
    ) -> None:
        """Create sensor observation in RDF graph."""
        # Create sensor resource
        sensor = URIRef(f"{self._settings.SWOT_URL_PREFIX}sensor/{sensor_id}")
        self.graph.add((sensor, RDF.type, self.SOSA.Sensor))
        self.graph.add((sensor, self.SOSA.isHostedBy, node))

        # Create observation resource
        observation = URIRef(
            f"{self._settings.SWOT_URL_PREFIX}observation/{sensor_id}/{int(datetime.now().timestamp() * 1000)}"
        )

        self.graph.add((observation, RDF.type, self.SOSA.Observation))
        self.graph.add((observation, self.SOSA.hasFeatureOfInterest, sensor))
        self.graph.add((observation, self.SOSA.observedProperty, self.SOSA[sensor_type]))

        # Add timestamp
        timestamp_str = datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).isoformat()
        self.graph.add((
            observation,
            self.SOSA.resultTime,
            Literal(timestamp_str, datatype=XSD.dateTime)
        ))

        # Create quantity value
        quantity = URIRef(f"{observation}/quantity")
        self.graph.add((quantity, RDF.type, self.QUDT.QuantityValue))
        self.graph.add((quantity, self.QUDT.numericValue, Literal(value, datatype=XSD.decimal)))
        self.graph.add((quantity, self.QUDT.unit, URIRef(unit_uri)))

        # Link observation to result
        self.graph.add((observation, self.SOSA.hasResult, quantity))

    def map_sensor_data_to_rdf(self, data: SensorNodeRecord) -> None:
        """Map sensor data to RDF and save to triple store."""
        try:
            # Create node resource
            node = URIRef(f"{self._settings.SWOT_URL_PREFIX}node/{data.id}")

            # Add node properties
            self.graph.add((node, RDF.type, self.IOTLITE.Device))
            self.graph.add((node, self.IOTLITE.hasZone, Literal(data.zone)))
            self.graph.add((node, self.GEO.lat, Literal(data.latitude, datatype=XSD.decimal)))
            self.graph.add((node, self.GEO.long, Literal(data.longitude, datatype=XSD.decimal)))

            # Create observations for each sensor type
            self._create_sensor_observation(
                node, f"{data.id}-T", "Temperature",
                data.temperature, f"{self.UNIT}DegreeCelsius", data.timestamp
            )
            self._create_sensor_observation(
                node, f"{data.id}-H", "Humidity",
                data.humidity, f"{self.UNIT}Percent", data.timestamp
            )
            self._create_sensor_observation(
                node, f"{data.id}-AQ", "AirQuality",
                float(data.air_quality), f"{self.UNIT}AQI", data.timestamp
            )
            self._create_sensor_observation(
                node, f"{data.id}-N", "NoiseLevel",
                data.noise_level, f"{self.UNIT}Decibel", data.timestamp
            )

            # Save to triple store
            self._triple_store.save_model(self.graph)

        except Exception as e:
            raise RuntimeError(f"Error mapping sensor data to RDF: {str(e)}")
