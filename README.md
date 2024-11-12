# SWoT CLI Tool

A command-line tool for creating and managing projects based on the SWoT (Semantic Web of Things) Framework.

## Description

SWoT CLI facilitates the implementation of the SWoT Framework by providing a base structure for developing applications that integrate IoT with Semantic Web. The tool automates initial setup and provides a pre-configured development environment.

## ⚠️ Important Installation Note

The tool binary is available in the GitHub "Releases" section. Select the appropriate file for your operating system:

- **Windows x86**: `swot_cli-windows-amd64.exe`
- **macOS ARM**: `swot_cli-macos-arm64.dmg`
- **macOS x86**: `swot_cli-macos-amd64.dmg`
- **Linux x86**: `swot_cli-linux-amd64`

## Prerequisites

- Docker 24.0+
- Docker Compose 2.23+
- Depending on the selected language:
  - Java 23+ (for Java projects)
  - Python 3.11+ (for Python projects)
  - Node.js 20+ (for TypeScript projects)

## Usage

### Initialize a New Project

```bash
swot init <project-name> [options]

Options:
  --no-demo         Exclude examples and demo code
  --no-jena         Exclude Apache Jena integration
  --no-mosquitto    Exclude MQTT broker
  --no-sensors      Exclude sensor simulator
  --lang            Select language (java, python, typescript)
  --lang-version    Language version
  --tool-version    Framework version (e.g., Spring Boot)
```

### Run a Project

```bash
swot run <project-name> [options]

Options:
  --refresh    Rebuild and refresh containers
```

## Generated Project Structure

```
project/
├── docker-compose.yml
├── swot.yaml
├── jena/              # If --no-jena is not used
├── mosquitto/         # If --no-mosquitto is not used
├── sensors/           # If --no-sensors is not used
├── mapper/
├── reasoner/
├── api/
├── gateway/
└── dashboard/
```

## Available Services

By default, the following services will be available:

- **Triplestore**: http://localhost:3030 (Fuseki)
- **REST API**: http://localhost:8081/swagger-ui.html
- **Dashboard**: http://localhost:8090
- **Gateway**: http://localhost:8080
- **MQTT**: tcp://localhost:1883 (Mosquitto)

## Usage Examples

### Create a New Java Project with All Features

```bash
swot init my-project --lang java
```

### Create a Minimal Project without Demo Components

```bash
swot init my-project --no-demo --no-sensors --lang java
```

### Run an Existing Project

```bash
swot run my-project
```

### Rebuild and Update Containers

```bash
swot run my-project --refresh
```

## Troubleshooting

### Ports in Use
If you encounter port-related errors, ensure the following ports are available:
- 3030 (Jena Fuseki)
- 1883 (MQTT)
- 8080 (Gateway)
- 8081 (API)
- 8090 (Dashboard)

### Memory Issues
Ensure Docker has sufficient memory allocated (minimum free 4GB recommended).

## Contributing

Contributions are welcome. Please review the contribution guidelines before submitting a pull request.

## License

This project is licensed under the MIT License (Non-Commercial) - see the LICENSE file for details.

## Academic Citation

If you use this framework in your research, please cite:

```bibtex
@mastersthesis{galindo2024swot,
    author = {Galindo-Semanate, Manuel Fernando},
    title = {Framework for Developing Semantic Interaction Applications for IoT Devices},
    school = {University of Cauca},
    year = {2024},
    address = {Popayán, Colombia}
}
```