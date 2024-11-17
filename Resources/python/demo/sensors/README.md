# Smart City Sensor Simulator

A Python-based simulator for generating and publishing smart city sensor data via MQTT.

## Features

- Simulates multiple sensor types (temperature, humidity, air quality, noise)
- Configurable sensor locations and zones
- MQTT messaging with QoS support
- Structured logging
- Type-annotated codebase
- Comprehensive test suite

## Requirements

- Python 3.8 or higher
- MQTT Broker (e.g., Mosquitto)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-city-sensor.git
cd smart-city-sensor
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
# For production
pip install -e .

# For development
pip install -e ".[dev]"
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```bash
MQTT_BROKER=localhost
MQTT_TOPIC=sensors/readings
SIMULATION_INTERVAL=60
LOG_LEVEL=INFO
```

## Usage

Run the simulator:
```bash
python -m sensors.main
```

## Development

### Code Quality

```bash
# Format code
black src tests
isort src tests

# Type checking
mypy src

# Linting
flake8 src tests
pylint src tests

# Run tests
pytest
```

### Generate Coverage Report

```bash
pytest --cov=src tests/ --cov-report=html
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.