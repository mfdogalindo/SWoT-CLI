# 1. Introducción

## 1.1 Propósito
Este proyecto demuestra una implementación práctica del Framework SWoT (Semantic Web of Things) que ilustra la integración de dispositivos IoT con tecnologías de la Web Semántica. El sistema está diseñado para el monitoreo ambiental en tiempo real, procesando y analizando datos de múltiples tipos de sensores a través de una arquitectura distribuida con capacidades semánticas.

### Objetivos Principales
- Demostrar la implementación práctica de los principios del Framework SWoT
- Proporcionar un ejemplo funcional de integración IoT con Web Semántica
- Ilustrar el uso de ontologías estándar (SSN/SOSA, IoT-Lite) en un contexto real
- Mostrar el procesamiento semántico de datos IoT en tiempo real

## 1.2 Alcance
El sistema implementa un flujo completo de datos desde la generación hasta la visualización, incluyendo:

### Funcionalidades Core
- Simulación de sensores ambientales (temperatura, humedad, calidad del aire, ruido)
- Transformación de datos a formato semántico
- Procesamiento y razonamiento sobre datos
- Generación de alertas basadas en reglas
- Visualización y monitoreo en tiempo real

### Aspectos Técnicos Cubiertos
- Comunicación MQTT para datos de sensores
- Almacenamiento RDF en triplestore
- APIs RESTful para acceso a datos
- Interfaces de usuario web
- Orquestación de servicios con Docker
