# 4. Configuración y Despliegue

## 4.1 Requisitos del Sistema

### 4.1.1 Software Base
- Java Development Kit 23
- Docker 24.0+
- Docker Compose 2.23+
- Maven 3.9+ o Gradle 8.5+
- Git

### 4.1.2 Servicios Externos
- Apache Jena Fuseki 4.10+
- Eclipse Mosquitto 2.0+

## 4.2 Configuración del Entorno

### 4.2.1 Variables de Entorno
```bash
# Configuración de Triplestore
TRIPLESTORE_URL=http://jena:3030
TRIPLESTORE_DATASET=swot
TRIPLESTORE_USERNAME=admin
TRIPLESTORE_PASSWORD=******

# Configuración MQTT
MQTT_BROKER=tcp://mosquitto:1883
MQTT_TOPIC=sensors_swot
MQTT_CLIENT=CLIENT_MJSRZ

# URLs de Servicios
SWOT_URL_PREFIX=http://swot.local/
API_URL=http://api:8081
```

### 4.2.2 Configuración de Mosquitto
```conf
# mosquitto.conf
listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
```

## 4.3 Despliegue con Docker Compose

### 4.3.1 Estructura de Servicios
```yaml
services:
  jena:
    image: stain/jena-fuseki
    environment:
      - ADMIN_PASSWORD=F8jwCd74piU98vAQ
    volumes:
      - ./jena/data:/fuseki
    ports:
      - "3030:3030"

  mosquitto:
    build: ./mosquitto
    ports:
      - "1883:1883"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log

  # ... otros servicios
```

### 4.3.2 Comandos de Despliegue
```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f [servicio]

# Detener servicios
docker-compose down
```

### 4.3.3 Verificación del Despliegue
```bash
# Verificar Mosquitto
mosquitto_sub -h localhost -t "sensors_swot" -v

# Verificar Jena Fuseki
curl -X GET http://localhost:3030/$/ping

# Verificar API
curl -X GET http://localhost:8081/api/v1/sensor
```
