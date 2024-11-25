import { BaseRepository } from "../repositories/base.repository";
import { ActuatorData, SensorData } from "../types/devices.types";
import { QueriesTool } from "../utils/queries.tool";
import { logger } from "../utils/logger.service";
import { log } from "console";

export class SemanticMapping {
  private readonly baseURI: string = 'http://example.org/nursing-home#';
  private readonly prefixes: string = `
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix sosa: <http://www.w3.org/ns/sosa/> .
    @prefix ssn: <http://www.w3.org/ns/ssn/> .
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .
    @prefix time: <http://www.w3.org/2006/time#> .
    @prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
    @prefix nh: <${this.baseURI}> .
  `;


  async mapSensorData(sensorData: SensorData): Promise<string> {
    try {
      const sensor = await BaseRepository.findSensor(sensorData.sensorId);
      const person = await BaseRepository.findPerson(sensor.personId);
      const zone = await BaseRepository.findZone(sensorData.location.zoneId);

      return `${this.prefixes}
        nh:observation_${QueriesTool.sanitizeId(sensorData.sensorId)}_${sensorData.timestamp}
          rdf:type sosa:Observation ;
          sosa:madeBySensor nh:sensor_${QueriesTool.sanitizeId(sensorData.sensorId)} ;
          sosa:hasFeatureOfInterest nh:zone_${QueriesTool.sanitizeId(zone.id)} ;
          sosa:observedProperty nh:${sensorData.type.toLowerCase()} ;
          sosa:resultTime "${QueriesTool.createTimestamp(sensorData.timestamp)}"^^xsd:dateTime ;
          sosa:hasResult [
            rdf:type nh:${sensorData.type}Result ;
            nh:value "${sensorData.value}"^^xsd:string
          ] .

        nh:sensor_${QueriesTool.sanitizeId(sensorData.sensorId)}
          rdf:type sosa:Sensor ;
          rdfs:label "${sensor.description || 'Sensor ' + sensor.id}"@en ;
          sosa:observes nh:${sensorData.type.toLowerCase()} ;
          nh:monitors nh:person_${QueriesTool.sanitizeId(person.id)} .

        nh:person_${QueriesTool.sanitizeId(person.id)}
          rdf:type foaf:Person ;
          foaf:name "${person.name}" ;
          nh:type "${person.type}" ;
          ${person.preferredTemp ? `nh:preferredTemperature "${person.preferredTemp}"^^xsd:decimal ;` : ''}
          nh:isLocatedIn nh:zone_${QueriesTool.sanitizeId(sensorData.location.zoneId)} .

        nh:zone_${QueriesTool.sanitizeId(zone.id)}
          rdf:type nh:Zone ;
          rdfs:label "${zone.name}"@en ;
          nh:zoneType "${zone.type}" .
      `;
    } catch (error) {
      logger.error('Error mapping sensor: {}', error);
      throw error;
    }
  }

  async mapActuatorData(actuatorData: ActuatorData): Promise<string> {
    try {
      const actuator = await BaseRepository.findActuator(actuatorData.actuatorId);
      const zone = await BaseRepository.findZone(actuatorData.location.zoneId);

      return `${this.prefixes}
        nh:actuatorState_${QueriesTool.sanitizeId(actuatorData.actuatorId)}_${actuatorData.timestamp}
          rdf:type sosa:Actuation ;
          sosa:madeByActuator nh:actuator_${QueriesTool.sanitizeId(actuatorData.actuatorId)} ;
          sosa:hasFeatureOfInterest nh:zone_${QueriesTool.sanitizeId(zone.id)} ;
          sosa:resultTime "${QueriesTool.createTimestamp(actuatorData.timestamp)}"^^xsd:dateTime ;
          sosa:hasResult [
            rdf:type nh:${actuatorData.type}State ;
            nh:value "${actuatorData.value}"^^${this.getValueDatatype(actuatorData.type, actuatorData.value)}
          ] .

        nh:actuator_${QueriesTool.sanitizeId(actuatorData.actuatorId)}
          rdf:type sosa:Actuator ;
          rdfs:label "${actuator.description || 'Actuator ' + actuator.id}"@en ;
          nh:type "${actuator.type}" ;
          nh:controls nh:zone_${QueriesTool.sanitizeId(zone.id)} .

        nh:zone_${QueriesTool.sanitizeId(zone.id)}
          rdf:type nh:Zone ;
          rdfs:label "${zone.name}"@en ;
          nh:zoneType "${zone.type}" .
      `;
    } catch (error) {
      logger.error('Error mapping actuator data:', error);
      throw error;
    }
  }

  async mapFallAlert(sensorData: SensorData): Promise<string> {
    try {
      const sensor = await BaseRepository.findSensor(sensorData.sensorId);
      const person = await BaseRepository.findPerson(sensor.personId);

      return `${this.prefixes}
        nh:fallAlert_${QueriesTool.sanitizeId(sensorData.sensorId)}_${sensorData.timestamp}
          rdf:type nh:FallAlert ;
          sosa:madeBySensor nh:sensor_${QueriesTool.sanitizeId(sensorData.sensorId)} ;
          nh:alertTime "${QueriesTool.createTimestamp(sensorData.timestamp)}"^^xsd:dateTime ;
          nh:concernsPerson nh:person_${QueriesTool.sanitizeId(person.id)} ;
          nh:location nh:zone_${QueriesTool.sanitizeId(sensorData.location.zoneId)} .
      `;
    } catch (error) {
      logger.error('Error mapping fall alert:', error);
      throw error;
    }
  }

  private getValueDatatype(type: string, value: any): string {
    switch (type) {
      case 'TEMPERATURE':
        return 'xsd:decimal';
      case 'LIGHT':
      case 'ALARM':
        return 'xsd:boolean';
      default:
        return 'xsd:string';
    }
  }

}


// Singleton instance of SemanticMapping
export const semanticMapping = new SemanticMapping();