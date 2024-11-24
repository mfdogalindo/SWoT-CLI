import { Actuator, ActuatorCommand } from '../models/actuator';
import { PREFIXES } from './prefixes';

export class ActuatorOntology {
  private static baseUri = 'http://example.org/nursing-home';

  public static toTurtle(actuator: Actuator): string {
    const actuatorUri = `${this.baseUri}/actuator/${actuator.id}`;
    
    return `
${PREFIXES}
<${actuatorUri}> rdf:type iot-lite:Actuator ;
    nursing:type "${actuator.type}"^^xsd:string ;
    nursing:location <${this.baseUri}/location/${actuator.location}> ;
    nursing:currentValue "${actuator.currentValue}"^^xsd:string ;
    nursing:active "${actuator.active}"^^xsd:boolean ;
    nursing:createdAt "${actuator.createdAt.toISOString()}"^^xsd:dateTime ;
    nursing:updatedAt "${actuator.updatedAt.toISOString()}"^^xsd:dateTime .
`;
  }

  public static commandToTurtle(command: ActuatorCommand): string {
    const commandUri = `${this.baseUri}/command/${command.actuatorId}_${command.timestamp}`;
    
    return `
${PREFIXES}
<${commandUri}> rdf:type nursing:ActuatorCommand ;
    nursing:forActuator <${this.baseUri}/actuator/${command.actuatorId}> ;
    nursing:commandValue "${command.command}"^^xsd:string ;
    nursing:timestamp "${new Date(command.timestamp).toISOString()}"^^xsd:dateTime .
`;
  }
}