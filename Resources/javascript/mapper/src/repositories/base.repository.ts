import { dataService } from "../database/data.service";
import { Actuator, Person, Sensor, Zone } from "../types/database.types";


export class BaseRepository {
  static async findSensor(sensorId: string): Promise<Sensor> {
    const sensors = await dataService.getSensors();
    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) throw new Error(`Sensor not found: ${sensorId}`);
    return sensor;
  }

  static async findPerson(personId: string): Promise<Person> {
    const persons = await dataService.getPersons();
    const person = persons.find(p => p.id === personId);
    if (!person) throw new Error(`Person not found: ${personId}`);
    return person;
  }

  static async findZone(zoneId: string): Promise<Zone> {
    const zones = await dataService.getZones();
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) throw new Error(`Zone not found: ${zoneId}`);
    return zone;
  }

  static async findActuator(actuatorId: string): Promise<Actuator> {
    const actuators = await dataService.getActuators();
    const actuator = actuators.find(a => a.id === actuatorId);
    if (!actuator) throw new Error(`Actuator not found: ${actuatorId}`);
    return actuator;
  }
}