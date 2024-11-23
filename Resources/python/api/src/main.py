from fastapi import FastAPI, HTTPException, Query

from models.api import Page
from models.sensor import SensorDetail, SensorType
from services.alerts_service import get_alerts_service
from services.readings_service import get_readings_service
from services.sensor_service import get_sensor_service

sensor_service = get_sensor_service()
alerts_service = get_alerts_service()
readings_service = get_readings_service()

# Creación de la aplicación FastAPI con metadatos
app = FastAPI(
    title="Environmental Monitoring API",
    description="""
    API para el monitoreo ambiental que permite acceder a datos de sensores y sus lecturas.

    Características principales:
    * Consulta de sensores y sus detalles
    * Obtención de lecturas por tipo de sensor
    * Monitoreo de alertas
    * Paginación de resultados
    """,
    version="1.0.0",
    contact={
        "name": "Equipo de Desarrollo",
        "url": "http://example.com/contact",
        "email": "api@example.com",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)


@app.get(
    "/api/v1/sensor/{sensor_id}",
    response_model=SensorDetail,
    tags=["Sensors"],
    summary="Obtener detalles de un sensor",
    responses={
        200: {
            "description": "Detalles del sensor solicitado",
            "content": {
                "application/json": {
                    "example": {
                        "id": "sensor123",
                        "zone": "Zone A",
                        "latitude": 40.7128,
                        "longitude": -74.0060,
                        "total_observations": 150,
                        "total_alerts": 5,
                        "last_reading": "2024-11-21T10:30:00"
                    }
                }
            }
        },
        404: {
            "description": "Sensor no encontrado",
            "content": {
                "application/json": {
                    "example": {"detail": "Sensor not found"}
                }
            }
        }
    }
)
async def get_sensor(sensor_id: str):
    """
    Obtiene los detalles de un sensor específico por su ID.

    - **sensor_id**: ID único del sensor a consultar
    """
    try:
        sensor = sensor_service.get_sensor_by_id(sensor_id)
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor not found")
        return sensor
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/sensor",
    response_model=Page,
    tags=["Sensors"],
    summary="Obtener lista de sensores",
)
async def get_all_sensors(
        page: int = Query(0, description="Número de página", ge=0),
        size: int = Query(50, description="Tamaño de la página", ge=1, le=100)
):
    """
    Obtiene una lista paginada de todos los sensores.

    Parámetros:
    - **page**: Número de página (0 en adelante)
    - **size**: Cantidad de elementos por página (1-100)
    """
    try:
        return sensor_service.get_all_sensors(page, size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/environment/{sensor_type}/readings",
    response_model=Page,
    tags=["Readings"],
    summary="Obtener lecturas por tipo de sensor"
)
async def get_sensor_readings(
        sensor_type: SensorType,
        page: int = Query(0, description="Número de página", ge=0),
        size: int = Query(50, description="Tamaño de la página", ge=1, le=100)
):
    """
    Obtiene las lecturas de un tipo específico de sensor.

    Parámetros:
    - **sensor_type**: Tipo de sensor (TEMPERATURE, HUMIDITY, NOISE, AIR_QUALITY)
    - **page**: Número de página (0 en adelante)
    - **size**: Cantidad de elementos por página (1-100)
    """
    try:
        return readings_service.get_readings_by_type(sensor_type, page, size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/alerts/{sensor_type}",
    response_model=Page,
    tags=["Alerts"],
    summary="Obtener alertas por tipo de sensor"
)
async def get_sensor_alerts(
        sensor_type: SensorType,
        page: int = Query(0, description="Número de página", ge=0),
        size: int = Query(50, description="Tamaño de la página", ge=1, le=100)
):
    """
    Obtiene las alertas generadas para un tipo específico de sensor.

    Parámetros:
    - **sensor_type**: Tipo de sensor (TEMPERATURE, HUMIDITY, NOISE, AIR_QUALITY)
    - **page**: Número de página (0 en adelante)
    - **size**: Cantidad de elementos por página (1-100)
    """
    try:
        return alerts_service.get_alerts_by_type(sensor_type, page, size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8081)
