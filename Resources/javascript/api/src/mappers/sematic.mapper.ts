// src/services/semantic/turtle-parser.service.ts
import { Parser, Quad } from 'n3';
import { Sensor, Actuator } from '../models';
import { logger } from '../utils/logger.service';

export class SemanticMapper {
  private parser: Parser;
  
  constructor() {
    this.parser = new Parser({ format: 'Turtle' });
  }

  async toSensor(turtleData: Buffer | string): Promise<Sensor | null> {
    try {
      const turtleString = this.ensureString(turtleData);
      const quads = await this.parser.parse(turtleString);
      const observation: Partial<Sensor> = {};
      
      for (const quad of quads) {
        if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
            quad.object.value === 'http://www.w3.org/ns/sosa/Observation') {
          observation.id = quad.subject.value;
        }
        
        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/resultTime') {
          observation.timestamp = quad.object.value;
        }

        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/madeBySensor') {
          observation.sensorId = this.extractLocalName(quad.object.value);
        }

        if (quad.predicate.value === 'http://example.org/nursing-home#value') {
          observation.value = this.parseValue(quad.object.value);
        }

        // Extraer información de la zona
        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/hasFeatureOfInterest') {
          const zoneId = this.extractLocalName(quad.object.value);
          observation.location = {
            zoneId: zoneId.replace('zone_', ''),
            zoneType: this.getZoneType(zoneId)
          };
        }

        // Extraer información de la persona si existe
        if (quad.predicate.value === 'http://example.org/nursing-home#monitors') {
          observation.person = await this.extractPersonInfo(quad.object.value, quads);
        }
      }

      return observation as Sensor;
    } catch (error) {
      logger.error('Error parsing turtle data:', error);
      return null;
    }
  }

  async toActuator(turtleData: Buffer | string): Promise<Actuator | null> {
    try {
      const turtleString = this.ensureString(turtleData);
      const quads = await this.parser.parse(turtleString);
      const actuator: Partial<Actuator> = {};

      for (const quad of quads) {
        if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
            quad.object.value === 'http://www.w3.org/ns/sosa/Actuation') {
          actuator.id = quad.subject.value;
        }

        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/resultTime') {
          actuator.timestamp = quad.object.value;
        }

        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/madeByActuator') {
          actuator.actuatorId = this.extractLocalName(quad.object.value);
        }

        if (quad.predicate.value === 'http://example.org/nursing-home#value') {
          actuator.value = this.parseValue(quad.object.value);
        }

        if (quad.predicate.value === 'http://example.org/nursing-home#type') {
          actuator.type = quad.object.value;
        }

        if (quad.predicate.value === 'http://www.w3.org/ns/sosa/hasFeatureOfInterest') {
          const zoneId = this.extractLocalName(quad.object.value);
          actuator.location = {
            zoneId: zoneId.replace('zone_', ''),
            zoneType: this.getZoneType(zoneId)
          };
        }
      }

      return actuator as Actuator;
    } catch (error) {
      logger.error('Error parsing turtle actuator data:', error);
      return null;
    }
  }

  private ensureString(data: Buffer | string): string {
    let stringData = '';
    
    if (Buffer.isBuffer(data)) {
      stringData = data.toString('utf8');
    } else {
      stringData = data;
    }
  
    // Limpiamos el string de escape sequences y comillas extras
    try {
      // Si es un JSON string, lo parseamos primero
      if (stringData.trim().startsWith('"')) {
        stringData = JSON.parse(stringData);
      }
      
      // Eliminamos cualquier \n inicial si existe
      if (stringData.startsWith('\n')) {
        stringData = stringData.replace(/^\n+/, '');
      }
      
      // Eliminamos espacios extras al inicio
      stringData = stringData.trimStart();
      
      return stringData;
    } catch (error) {
      logger.warn('Error cleaning turtle string:', error);
      return stringData; // Retornamos el string original si hay error en la limpieza
    }
  }

  private extractLocalName(uri: string): string {
    const parts = uri.split('#');
    return parts[parts.length - 1];
  }

  private parseValue(value: string): string | number | boolean {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }
    
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
    
    return value;
  }

  private async extractPersonInfo(personUri: string, quads: Quad[]): Promise<{
    id: string;
    name: string;
    type: string;
    preferredTemperature?: number;
  } | undefined> {
    const personInfo: any = {
      id: this.extractLocalName(personUri)
    };

    for (const quad of quads) {
      if (quad.subject.value === personUri) {
        switch (quad.predicate.value) {
          case 'http://xmlns.com/foaf/0.1/name':
            personInfo.name = quad.object.value;
            break;
          case 'http://example.org/nursing-home#type':
            personInfo.type = quad.object.value;
            break;
          case 'http://example.org/nursing-home#preferredTemperature':
            personInfo.preferredTemperature = parseFloat(quad.object.value);
            break;
        }
      }
    }

    return Object.keys(personInfo).length > 1 ? personInfo : undefined;
  }

  private getZoneType(zoneId: string): string {
    // Mapeo de zonas basado en el ID
    const zoneTypes: {[key: string]: string} = {
      'room': 'ROOM',
      'bathroom': 'BATHROOM',
      'living_room': 'LIVING_ROOM',
      'dining_room': 'DINING_ROOM',
      'yard': 'YARD'
    };

    for (const [key, value] of Object.entries(zoneTypes)) {
      if (zoneId.includes(key)) {
        return value;
      }
    }
    
    return 'UNKNOWN';
  }
}

// Singleton instance of SemanticMapper
export const semanticMapper = new SemanticMapper();