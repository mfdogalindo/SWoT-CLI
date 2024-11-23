# SWoT Framework Demo: API

Part of the Semantic Web of Things (SWoT) Framework, this API provides a comprehensive interface for managing and monitoring environmental sensor data using semantic web technologies.

## Overview

The SWoT Framework API is built with FastAPI and integrates with an RDF triplestore to provide semantic data management for IoT sensor networks. It handles various types of environmental sensors including temperature, humidity, noise level, and air quality measurements.

## Features

- **Sensor Management**
  - Retrieve sensor details and metadata
  - Get sensor readings with pagination
  - Monitor sensor status and last readings

- **Environmental Monitoring**
  - Real-time sensor data access
  - Historical data retrieval
  - Multi-sensor type support (Temperature, Humidity, Noise, Air Quality)

- **Alert System**
  - Real-time alert monitoring
  - Alert severity classification
  - Historical alert data access

## Project Structure

```
api/
├── models/
│   ├── __init__.py
│   ├── api.py
│   └── sensor.py
├── services/
│   ├── __init__.py
│   ├── alerts_service.py
│   ├── readings_service.py
│   ├── sensor_service.py
│   └── sparql_queries.py
├── repositories/
│   ├── __init__.py
│   └── jena.py
├── requirements.txt
├── main.py
└── README.md
```

## Requirements

- Python 3.8+
- FastAPI
- Pydantic
- Apache Jena Fuseki (or compatible triplestore)
- `requirements.txt` dependencies

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SWoT Framework.git
cd SWoT Framework/api
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
API_URL=http://localhost:8090
TRIPLESTORE_URL=http://localhost:3030
TRIPLESTORE_DATASET=swot
TRIPLESTORE_USERNAME=admin
TRIPLESTORE_PASSWORD=admin
```

## Usage

1. Start the API server:
```bash
uvicorn main:app --reload --port 8090
```

2. Access the API documentation:
- Swagger UI: `http://localhost:8090/docs`
- ReDoc: `http://localhost:8090/redoc`

## API Endpoints

### Sensors

- `GET /api/v1/sensor/{sensor_id}` - Get sensor details
- `GET /api/v1/sensor` - List all sensors (paginated)

### Readings

- `GET /api/v1/environment/{sensor_type}/readings` - Get sensor readings by type

### Alerts

- `GET /api/v1/alerts/{sensor_type}` - Get alerts by sensor type

## SPARQL Queries

The API uses SPARQL queries to interact with the RDF triplestore. Main query types include:

- Sensor details retrieval
- Reading measurements
- Alert monitoring
- Statistical aggregations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2024 SWoT Framework Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contact

Project Link: [https://github.com/mfdogalindo/SWoT-CLI](https://github.com/mfdogalindo/SWoT-CLI)

## Acknowledgments

- FastAPI framework
- Apache Jena
- RDFLib
- Semantic Web community
