import { jenaService } from './jena.service';
import { mqttService } from './mqtt.service';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class TemperatureService {
  private requestStateTimeout: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    this.requestStateTimeout = setInterval(
      () => this.checkTemperatures(),
      config.reasoner.temperatureCheckInterval
    );
    logger.info('Temperature service started');
  }

  async stop(): Promise<void> {
    if (this.requestStateTimeout) {
      clearInterval(this.requestStateTimeout);
    }
  }

  private async checkTemperatures(): Promise<void> {
   try {
     // Request current actuator states
     mqttService.publish(config.topics.actuators.stateRequest, '{}');

     // Query for occupied zones and their temperatures
     const query = `
       PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
       PREFIX nh: <http://example.org/nursing-home#>
       PREFIX foaf: <http://xmlns.com/foaf/0.1/>
       PREFIX sosa: <http://www.w3.org/ns/sosa/>
       PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
       
       SELECT ?zone (AVG(?prefTemp) as ?avgPrefTemp) (COUNT(?person) as ?occupants)
       WHERE {
         ?person rdf:type foaf:Person ;
                nh:isLocatedIn ?zone ;
                nh:type "resident" .
         OPTIONAL { ?person nh:preferredTemperature ?prefTemp }
       }
       GROUP BY ?zone
     `;

     const result = await jenaService.query(config.jena.dataset, query, true);
     
     // Process each zone
     for (const binding of result.results.bindings) {
       const zone = binding.zone.value;
       const occupants = parseInt(binding.occupants.value);
       const avgPrefTemp = binding.avgPrefTemp ? 
         parseFloat(binding.avgPrefTemp.value) : 
         config.reasoner.defaultEmptyRoomTemp;

       const targetTemp = occupants > 0 ? avgPrefTemp : config.reasoner.defaultEmptyRoomTemp;

      console.log("zone " , zone)

       this.setTemperature(`temp${zone.split('#zone')[1]}`, targetTemp);

       logger.info(`Adjusting temperature for ${zone} to ${targetTemp}°C`);

       // Store command in persistent storage
       const persistCommandQuery = `
         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
         PREFIX nh: <http://example.org/nursing-home#>
         PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
         PREFIX sosa: <http://www.w3.org/ns/sosa/>
         
         INSERT DATA {
           nh:tempCommand_${zone.split('#')[1]}_${Date.now()}
             rdf:type nh:TemperatureCommand ;
             sosa:hasFeatureOfInterest <${zone}> ;
             nh:targetTemperature "${targetTemp}"^^xsd:decimal ;
             nh:timestamp "${new Date().toISOString()}"^^xsd:dateTime ;
             nh:occupants "${occupants}"^^xsd:integer .
         }
       `;
       await jenaService.update(config.jena.dataset, persistCommandQuery, false);
     }

     // Clean up processed entries from memory dataset
     const cleanupQuery = `
       PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
       PREFIX sosa: <http://www.w3.org/ns/sosa/>
       
       DELETE {
         ?observation ?p ?o .
         ?result ?p2 ?o2 .
       }
       WHERE {
         ?observation rdf:type sosa:Observation ;
                     sosa:hasResult ?result .
         ?observation ?p ?o .
         ?result ?p2 ?o2 .
       }
     `;
     await jenaService.update(config.jena.dataset, cleanupQuery, true);

   } catch (error) {
     logger.error('Error in temperature adjustment:', error);
   }
 }

   private setTemperature(actuatorId: string, value: number){
      const command = {
         actuatorId: actuatorId,
         command: value,
         type: 'UPDATE_VALUE'
      };

      mqttService.publish(config.topics.actuators.command, command);
   }

}
