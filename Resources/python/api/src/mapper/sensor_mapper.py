from datetime import datetime

from models.sensor import SensorDetail, SensorReading


def build_sensor_detail(result: dict) -> SensorDetail:
    """Build a SensorDetail object from a query result."""
    return SensorDetail(
        id=result['id'],
        zone=result.get('zone'),
        latitude=float(result['lat']) if 'lat' in result else None,
        longitude=float(result['long']) if 'long' in result else None,
        total_observations=int(result['totalObs']),
        total_alerts=int(result['totalAlerts']),
        last_reading=datetime.fromisoformat(result['lastReading']) if 'lastReading' in result else None
    )


def build_sensor_reading(result: dict) -> SensorReading:
    """Build a SensorReading object from a query result."""
    return SensorReading(
        sensor_id=result['sensorId'],
        value=float(result['value']),
        unit=result['unit'],
        timestamp=datetime.fromisoformat(result['timestamp']),
        processed=bool(result.get('processed', False))
    )
