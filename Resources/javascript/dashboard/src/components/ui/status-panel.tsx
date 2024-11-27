'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketStore } from "@/lib/websocket";
import { Person, SensorData } from "@/types";

export function StatusPanel() {
  const { sensors,  personLocations, isConnected } = useWebSocketStore();


  const getPeopleByType = (type: Person['type']): Array<{person: Person, location: string}> => {
    // Obtener solo los sensores activos más recientes para cada persona
    const activeSensors = Array.from(sensors.values()).filter((sensor): sensor is SensorData & { person: Person } => {
      if (!sensor.person) return false;
      const currentSensorId = personLocations.get(sensor.person.id);
      return sensor.sensorId === currentSensorId && sensor.person.type === type;
    });

    return activeSensors.map(sensor => ({
      person: sensor.person,
      location: sensor.location.zoneId
    }));
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Conectando al servidor...</p>
      </div>
    );
  }

  if (sensors.size === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const residents = getPeopleByType('resident');
  const nurses = getPeopleByType('nurse');
  const staff = getPeopleByType('staff');

  const PersonList = ({ 
    title, 
    people
  }: { 
    title: string, 
    people: Array<{person: Person, location: string}>
  }) => (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      {people.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay {title.toLowerCase()} registrados</p>
      ) : (
        people.map(({person, location}) => (
          <div key={person.id} className="flex justify-between items-center py-1">
            <span>{person.name}</span>
            <span className="text-gray-500 text-sm">{location}</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="pt-4 grid grid-cols-2  gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Residentes</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonList title="Residentes" people={residents} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PersonList title="Enfermeras" people={nurses} />
            <PersonList title="Personal de apoyo" people={staff} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}