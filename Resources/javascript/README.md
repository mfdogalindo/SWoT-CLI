# Smart Nursing Home - Ambient Assisted Living System

## Overview

This project implements a semantic web-based ambient assisted living system for a nursing home environment, designed to enhance the quality of life and safety of elderly residents through intelligent environmental monitoring and control.

## System Architecture

The system follows the SWoT (Semantic Web of Things) framework architecture, implemented as a distributed system using Docker containers:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sensors    │────▶│  Mosquitto  │────▶│   Mapper    │────▶│   Apache    │
│  Simulator  │     │    MQTT     │     │  Semantic   │     │    Jena     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│    API      │◀────│  Reasoner   │◀────│  Triplestore│
│    UI       │     │   Server    │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Components

1. **Sensors Simulator** (TypeScript)
   - Simulates IoT sensors for:
     - Location tracking for residents and staff
     - Motion detection for fall detection
     - Temperature sensors in each zone
     - Light sensors in common areas
   - Publishes data via MQTT

2. **Mosquitto MQTT Broker**
   - Handles all sensor data communication
   - Provides secure, scalable message routing

3. **Semantic Mapper** (TypeScript)
   - Converts raw sensor data to RDF triples
   - Uses SSN/SOSA ontology for sensor data
   - Uses custom ontology for nursing home domain
   - Stores enriched data in Apache Jena triplestore

4. **Semantic Reasoner** (TypeScript)
   - Implements inference rules for:
     - Fall detection alerts
     - Temperature control based on occupancy
     - Automatic lighting control
     - Occupancy tracking
   - Uses Apache Jena for reasoning

5. **API Server** (TypeScript)
   - RESTful API with SwaggerUI documentation
   - Secure SPARQL endpoint
   - Specialized endpoints for:
     - Real-time occupancy data
     - Environmental controls
     - Alert management
     - Historical data analysis

6. **Dashboard** (TypeScript + React)
   - Real-time visualization of:
     - Facility map with occupancy tracking
     - Environmental conditions
     - Alert status and history
     - System controls

## Environment Setup

The project uses Docker Compose for orchestration. Key environment variables are managed through `.env` files:

```env
# Mosquitto Configuration
MQTT_PORT=1883
MQTT_WS_PORT=9001

# API Configuration
API_PORT=3000
API_JWT_SECRET=your-secret-key

# Triplestore Configuration
JENA_PORT=3030
JENA_DATASET=nursing-home

# Dashboard Configuration
DASHBOARD_PORT=80
```

## Facility Layout

The nursing home consists of:
- 5 bedrooms with private bathrooms
- Common living room
- Dining room
- Outdoor patio
- Staff areas

## Monitored Entities

### Residents
- Location tracking
- Motion/fall detection
- Temperature preferences
- Activity patterns

### Staff
- 2 nurses
- 1 maintenance/kitchen staff
- Location tracking
- Shift management

### Environmental Controls
- Per-zone temperature control
- Automated lighting:
  - 24/7 in bedrooms
  - 5 PM - 7 AM in common areas
- Emergency alert system

## Getting Started [To Do]

1. Clone the repository:
```bash
git clone https://github.com/your-org/smart-nursing-home.git
```

2. Create necessary `.env` files:
```bash
cp .env.example .env
```

3. Start the system:
```bash
docker-compose up -d
```

4. Access the dashboard:
```
http://localhost:80
```

5. Access the API documentation:
```
http://localhost:3000/api-docs
```

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- TypeScript 5+

### Project Structure
```
smart-nursing-home/
├── docker-compose.yml
├── .env
├── services/
│   ├── sensors/
│   ├── mapper/
│   ├── reasoner/
│   ├── api/
│   └── dashboard/
└── ontologies/
    ├── nursing-home.ttl
    └── rules.ttl
```

### Running Tests
```bash
npm run test
```

### Building
```bash
npm run build
```

## Ontology

The system uses the following ontologies:
- SSN/SOSA for sensor observations
- Custom nursing home ontology for domain modeling
- Location ontology for spatial relationships
- Time ontology for temporal aspects

## Security

- JWT-based API authentication
- TLS/SSL for MQTT communications
- Role-based access control
- Secure SPARQL endpoint with query validation

## Contributors

- Manuel Galindo Semanate (manuelgalindo@unicauca.edu.co)

## License

MIT License - see LICENSE file for details