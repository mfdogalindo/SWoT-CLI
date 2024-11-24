import { Sensor, SensorReading } from '../models/sensor';
import { PREFIXES } from './prefixes';

export class SensorOntology {
  private static baseUri = 'http://example.org/nursing-home';

  public static toTurtle(sensor: Sensor): string {
    const sensorUri = `${this.baseUri}/sensor/${sensor.id}`;
    
    return `
${PREFIXES}
<${sensorUri}> rdf:type sosa:Sensor ;
    ssn:implements <${this.baseUri}/procedure/${sensor.type}> ;
    nursing:type "${sensor.type}"^^xsd:string ;
    sosa:observes <${this.baseUri}/property/${sensor.type}> ;
    nursing:forPerson <${this.baseUri}/person/${sensor.personId}> ;
    nursing:location <${this.baseUri}/location/${sensor.location}> ;
    nursing:active "${sensor.active}"^^xsd:boolean ;
    nursing:createdAt "${sensor.createdAt.toISOString()}"^^xsd:dateTime ;
    nursing:updatedAt "${sensor.updatedAt.toISOString()}"^^xsd:dateTime .
`;
  }

  public static readingToTurtle(reading: SensorReading): string {
    const observationUri = `${this.baseUri}/observation/${reading.sensorId}_${reading.timestamp}`;
    
    return `
${PREFIXES}
<${observationUri}> rdf:type sosa:Observation ;
    sosa:madeBySensor <${this.baseUri}/sensor/${reading.sensorId}> ;
    sosa:hasSimpleResult "${reading.value}"^^xsd:string ;
    sosa:resultTime "${new Date(reading.timestamp).toISOString()}"^^xsd:dateTime ;
    nursing:location <${this.baseUri}/location/${reading.location}> .
`;
  }
}