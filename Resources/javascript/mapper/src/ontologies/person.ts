import { Person } from '../models/person';
import { PREFIXES } from './prefixes';

export class PersonOntology {
  private static baseUri = 'http://example.org/nursing-home';

  public static toTurtle(person: Person): string {
    const personUri = `${this.baseUri}/person/${person.id}`;
    
    return `
${PREFIXES}
<${personUri}> rdf:type foaf:Person ;
    foaf:name "${person.name}"^^xsd:string ;
    nursing:type "${person.type}"^^xsd:string ;
    nursing:active "${person.active}"^^xsd:boolean ;
    ${person.preferredTemp ? `nursing:preferredTemperature "${person.preferredTemp}"^^xsd:decimal ;` : ''}
    ${person.room ? `nursing:assignedRoom <${this.baseUri}/location/${person.room}> ;` : ''}
    nursing:createdAt "${person.createdAt.toISOString()}"^^xsd:dateTime ;
    nursing:updatedAt "${person.updatedAt.toISOString()}"^^xsd:dateTime .
`;
  }
}