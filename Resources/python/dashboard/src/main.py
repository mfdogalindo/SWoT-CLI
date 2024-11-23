# app.py
from datetime import datetime, timedelta
import logging
import pytz
from flask import Flask, render_template, request, abort

from models.sensors import SensorType
from services.dashboard import get_dashboard_service

app = Flask(__name__)
UTC = pytz.UTC
logger = logging.getLogger(__name__)

# Obtener servicio singleton
service = get_dashboard_service()

# Función para formatear fechas
def format_datetime(value):
    """Formato personalizado para fechas"""
    if value is None:
        return ""
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            return value
    return value.strftime('%Y-%m-%d %H:%M:%S')


# Registrar el filtro en Jinja2
app.jinja_env.filters['format_datetime'] = format_datetime

def parse_datetime(dt_str):
    """Convertir string ISO a datetime aware"""
    if not dt_str:
        return None
    try:
        # Primero intentar parse directo si ya tiene zona horaria
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt.astimezone(UTC)
    except ValueError:
        # Si falla, asumir que es UTC
        dt = datetime.fromisoformat(dt_str)
        return UTC.localize(dt)

# Funciones auxiliares para las plantillas
@app.context_processor
def utility_processor():
    return {
        'now': datetime.now(),
        'timedelta': timedelta
    }
# Filtro para mostrar fechas formateadas
@app.template_filter('format_datetime')
def format_datetime(value):
    """Formato personalizado para fechas"""
    if value is None:
        return ""
    if isinstance(value, str):
        value = parse_datetime(value)
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = UTC.localize(value)
        return value.strftime('%Y-%m-%d %H:%M:%S %Z')
    return str(value)

# Filtro para obtener objeto datetime
@app.template_filter('format_datetime_obj')
def format_datetime_obj(value):
    """Convertir string a objeto datetime"""
    if value is None:
        return None
    if isinstance(value, str):
        return parse_datetime(value)
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return UTC.localize(value)
        return value
    return None

@app.route("/")
def dashboard():
    # Crear un diccionario con toda la información de los sensores
    dashboard_data = {}

    for sensor_type in SensorType:
        # Usamos el endpoint como clave base
        type_key = sensor_type.endpoint

        # Obtenemos lecturas y alertas
        readings = service.get_sensor_readings(sensor_type, 0, 10)
        alerts = service.get_sensor_alerts(sensor_type, 0, 5)

        # Guardamos en el diccionario
        dashboard_data[type_key] = {
            'readings': readings,
            'alerts': alerts,
            'display_name': sensor_type.display_name,
            'unit': sensor_type.default_unit
        }

    return render_template(
        "dashboard.html",
        dashboard_data=dashboard_data,
        current_time=datetime.now(UTC)
    )

@app.route("/sensors")
def sensors():
    page = request.args.get("page", 0, type=int)
    size = request.args.get("size", 10, type=int)

    sensors = service.get_all_sensors(page, size)
    return render_template(
        "sensors.html",
        current_time=datetime.now(UTC),
        timedelta=timedelta,
        sensors=sensors,
        sensor_types=SensorType
    )


@app.route("/sensor/<sensor_id>")
def sensor_detail(sensor_id):
    sensor = service.get_sensor_by_id(sensor_id)
    if not sensor:
        abort(404)

    readings = {}
    for sensor_type in SensorType:
        readings[f"{sensor_type.endpoint}_readings"] = (
            service.get_sensor_readings(sensor_type, 0, 5)
        )

    return render_template(
        "sensor_detail.html",
        sensor=sensor,
        timedelta=timedelta,
        current_time=datetime.now(UTC),
        sensor_types=SensorType,
        **readings
    )


if __name__ == "__main__":
    app.run(port=8090, debug=True)