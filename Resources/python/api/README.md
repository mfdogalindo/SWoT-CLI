# Semantic Sensor Data Mapper

## Overview

The Semantic Sensor Data Mapper is a Python application that receives sensor data via MQTT and converts it into RDF (
Resource Description Framework) format, storing it in a triple store. This application is designed to work with IoT
sensor networks and provides semantic context to sensor measurements using standard ontologies.

## Features

- MQTT subscription for real-time sensor data ingestion
- RDF conversion using standard IoT and sensor ontologies (SOSA, SSN, IoT-Lite)
- Triple store integration for persistent storage
- FastAPI-based REST API
- Environment-based configuration
- Type-safe data handling with Pydantic
- Robust error handling and reconnection strategies

## Architecture

The application follows SOLID principles and clean architecture patterns:

- **Services Layer**: Core business logic for semantic mapping and triple store interaction
- **MQTT Layer**: Handles real-time data ingestion
- **Models Layer**: Type-safe data structures
- **Configuration Layer**: Environment-based settings management

### Used Ontologies

- SOSA (Sensor, Observation, Sample, and Actuator)
- SSN (Semantic Sensor Network)
- IoT-Lite
- GEO (WGS84 Geo Positioning)
- QUDT (Quantities, Units, Dimensions and Types)

## Prerequisites

- Python 3.9+
- MQTT Broker (e.g., Mosquitto)
- Triple Store (e.g., Apache Jena Fuseki)
- Poetry (recommended for dependency management)

## Installation

1. Generate codebase with swot_cli:

2. Install dependencies:

```bash
# Using pip
pip install -r requirements.txt

# Or using Poetry 
poetry install
```

## Configuration

1. Create a `.env` file in the project root:

```env
MQTT_BROKER=tcp://localhost:1883
MQTT_TOPIC=sensors_swot
MQTT_CLIENT=semantic-mapper
TRIPLESTORE_URL=http://localhost:3030
TRIPLESTORE_DATASET=swot
TRIPLESTORE_USERNAME=admin
TRIPLESTORE_PASSWORD=admin
SWOT_URL_PREFIX=http://example.com/
```

2. Configure your MQTT broker and triple store according to your environment.

## Usage

1. Start the application:

```bash
# Using Python directly
python main.py

# Or using Poetry
poetry run python main.py
```

2. Send sensor data to the MQTT topic in the following JSON format:

```json
{
  "id": "sensor123",
  "timestamp": 1637064000000,
  "temperature": 25.4,
  "humidity": 65.2,
  "air_quality": 85,
  "noise_level": 45.6,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "zone": "zone-A"
}
```

## API Documentation

The application exposes a FastAPI-based REST API. View the interactive documentation at:

```
http://localhost:8084/docs
```

## Data Model

### Sensor Node Record

```python
class SensorNodeRecord(BaseModel):
    id: str
    timestamp: int  # milliseconds since epoch
    temperature: float  # Celsius
    humidity: float  # Percentage
    air_quality: int  # AQI
    noise_level: float  # Decibels
    latitude: float
    longitude: float
    zone: str
```

## RDF Output Example

```turtle
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix iotlite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

<http://example.com/node/sensor123> a iotlite:Device ;
    iotlite:hasZone "zone-A" ;
    geo:lat "40.7128"^^xsd:decimal ;
    geo:long "-74.0060"^^xsd:decimal .

<http://example.com/observation/sensor123-T/1637064000000> a sosa:Observation ;
    sosa:hasFeatureOfInterest <http://example.com/sensor/sensor123-T> ;
    sosa:observedProperty sosa:Temperature ;
    sosa:resultTime "2021-11-16T12:00:00Z"^^xsd:dateTime ;
    sosa:hasResult [
        a qudt:QuantityValue ;
        qudt:numericValue "25.4"^^xsd:decimal ;
        qudt:unit unit:DegreeCelsius
    ] .
```

## Testing

Run the test suite:

```bash
# Using pytest
pytest

# Or using Poetry
poetry run pytest
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide
- Add type hints to all functions
- Write unit tests for new features
- Update documentation as needed

## Acknowledgments

- SOSA/SSN Ontology
- IoT-Lite Ontology
- FastAPI framework
- RDFLib community
