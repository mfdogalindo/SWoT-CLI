import { jenaService } from './jena.service';
import { mqttService } from './mqtt.service';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class FallDetectionService {
   private alarmTimeouts: Map<string, NodeJS.Timeout> = new Map();
   private lastCheckedTimestamp: string = new Date().toISOString();
   private requestStateTimeout: NodeJS.Timeout | null = null;

   private ALARM_ID = 'alarm_living_room';

   async start(): Promise<void> {
      this.requestStateTimeout = setInterval(
         () => this.checkForFallEvents(),
         config.reasoner.checkFallInterval
      );
      logger.info('Temperature service started');
   }

   async stop(): Promise<void> {
      if (this.requestStateTimeout) {
         clearInterval(this.requestStateTimeout);
      }
   }

   async checkForFallEvents(): Promise<void> {
      try {
         logger.debug('Checking for fall events...');
         // Query for fall events that occurred after our last check
         const query = `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX nh: <http://example.org/nursing-home#>
          PREFIX sosa: <http://www.w3.org/ns/sosa/>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          SELECT ?person ?zone ?timestamp ?observation
          WHERE {
            ?observation rdf:type sosa:Observation ;
                        sosa:observedProperty nh:movement ;
                        sosa:resultTime ?timestamp ;
                        sosa:madeBySensor ?sensor ;
                        sosa:hasFeatureOfInterest ?zone ;
                        sosa:hasResult [
                          rdf:type nh:MOVEMENTResult ;
                          nh:value "FALL_DETECTED"
                        ] .
            ?sensor nh:monitors ?person .
            FILTER(?timestamp > "${this.lastCheckedTimestamp}"^^xsd:dateTime)
          }
          ORDER BY ?timestamp
        `;

         const result = await jenaService.query(config.jena.dataset, query, true);

         if (result.results.bindings.length > 0) {
            const latestTimestamp = result.results.bindings[result.results.bindings.length - 1].timestamp.value;
            this.lastCheckedTimestamp = latestTimestamp;

            // Handle each fall event
            for (const binding of result.results.bindings) {
               const personUri = binding.person.value;
               const zoneUri = binding.zone.value;
               const observationUri = binding.observation.value;

               await this.handleFallDetection({
                  person: personUri.split('#')[1],
                  zone: zoneUri.split('#')[1],
                  timestamp: binding.timestamp.value,
                  observation: observationUri
               });

               // Store fall alert in persistent storage
               const persistAlertQuery = `
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              PREFIX nh: <http://example.org/nursing-home#>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
              
              INSERT DATA {
                nh:fallAlert_${Date.now()}
                  rdf:type nh:FallAlert ;
                  nh:person <${personUri}> ;
                  nh:zone <${zoneUri}> ;
                  nh:timestamp "${binding.timestamp.value}"^^xsd:dateTime ;
                  nh:triggeredBy <${observationUri}> .
              }
            `;
               await jenaService.update(config.jena.dataset, persistAlertQuery, false);
            }

            // Clean up processed entries from memory dataset
            const cleanupQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX nh: <http://example.org/nursing-home#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            
            DELETE {
              ?observation ?p ?o .
              ?result ?p2 ?o2 .
            }
            WHERE {
              ?observation rdf:type sosa:Observation ;
                          sosa:observedProperty nh:movement ;
                          sosa:hasResult ?result .
              ?observation ?p ?o .
              ?result ?p2 ?o2 .
              FILTER(EXISTS { 
                ?result rdf:type nh:MOVEMENTResult ;
                        nh:value "FALL_DETECTED" .
              })
            }
          `;
            await jenaService.update(config.jena.dataset, cleanupQuery, true);
         }
      } catch (error) {
         logger.error('Error checking for fall events:', error);
      }
   }

   private handleAlarm(state: boolean){
      const command = {
         actuatorId: this.ALARM_ID,
         command: state,
         type: 'UPDATE_VALUE'
      };

      mqttService.publish(config.topics.actuators.command, command);
   }

   private async handleFallDetection(data: { person: string, zone: string, timestamp: string, observation: string }): Promise<void> {
      try {
         // Activate alarm
         this.handleAlarm(true);
         logger.warn(`Fall detected for person ${data.person} in zone ${data.zone}! Activating alarm`);

         // Store alarm activation command in persistent storage
         const persistCommandQuery = `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX nh: <http://example.org/nursing-home#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          INSERT DATA {
            nh:alarmCommand_${Date.now()}
              rdf:type nh:AlarmCommand ;
              nh:command "true"^^xsd:boolean ;
              nh:timestamp "${new Date().toISOString()}"^^xsd:dateTime ;
              nh:triggeredBy nh:fallAlert_${data.observation.split('#')[1]} .
          }
        `;
         await jenaService.update(config.jena.dataset, persistCommandQuery, false);

         // Set timeout to deactivate alarm
         const timeout = setTimeout(async () => {
            this.handleAlarm(false);
            logger.info('Deactivating alarm');

            // Store alarm deactivation command
            const persistDeactivateQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX nh: <http://example.org/nursing-home#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            
            INSERT DATA {
              nh:alarmCommand_${Date.now()}
                rdf:type nh:AlarmCommand ;
                nh:command "false"^^xsd:boolean ;
                nh:timestamp "${new Date().toISOString()}"^^xsd:dateTime ;
                nh:triggeredBy nh:fallAlert_${data.observation.split('#')[1]} .
            }
          `;
            await jenaService.update(config.jena.dataset, persistDeactivateQuery, false);
         }, config.reasoner.alarmDuration);

         this.alarmTimeouts.set('alarm_living_room', timeout);
      } catch (error) {
         logger.error('Error handling fall detection:', error);
      }
   }

   cleanup(): void {
      for (const timeout of this.alarmTimeouts.values()) {
         clearTimeout(timeout);
      }
      this.alarmTimeouts.clear();
   }

}