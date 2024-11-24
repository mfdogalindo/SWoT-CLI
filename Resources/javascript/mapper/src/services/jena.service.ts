// src/services/jena.service.ts

/*

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger.service';

export class JenaService {
  private static instance: JenaService;
  private baseUrl: string;
  private auth: {
    username: string;
    password: string;
  };

  private constructor() {
    this.baseUrl = `${config.jena.host}/${config.jena.dataset}`;
    this.auth = {
      username: config.jena.username,
      password: config.jena.password
    };
  }

  public static getInstance(): JenaService {
    if (!JenaService.instance) {
      JenaService.instance = new JenaService();
    }
    return JenaService.instance;
  }

  public async insertData(turtle: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}${config.jena.endpoints.data}`,
        turtle,
        {
          headers: {
            'Content-Type': 'text/turtle',
          },
          auth: this.auth,
        }
      );
    } catch (error) {
      logger.error('Error inserting data into Jena:', error);
      throw error;
    }
  }

  public async executeSparqlUpdate(query: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}${config.jena.endpoints.update}`,
        query,
        {
          headers: {
            'Content-Type': 'application/sparql-update',
          },
          auth: this.auth,
        }
      );
    } catch (error) {
      logger.error('Error executing SPARQL update:', error);
      throw error;
    }
  }

  public async querySparql<T>(query: string): Promise<T[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}${config.jena.endpoints.query}`,
        {
          params: {
            query,
            format: 'json',
          },
          auth: this.auth,
        }
      );
      return this.processResults<T>(response.data);
    } catch (error) {
      logger.error('Error executing SPARQL query:', error);
      throw error;
    }
  }

  public async deleteOldData(hours: number): Promise<void> {
    const query = `
      DELETE {
        ?s ?p ?o
      }
      WHERE {
        ?s ?p ?o ;
           sosa:resultTime ?time .
        FILTER (?time < "${new Date(Date.now() - hours * 3600000).toISOString()}"^^xsd:dateTime)
      }
    `;

    await this.executeSparqlUpdate(query);
  }

  private processResults<T>(response: any): T[] {
    const bindings = response.results.bindings;
    return bindings.map((binding: any) => {
      const result: any = {};
      Object.keys(binding).forEach(key => {
        result[key] = binding[key].value;
      });
      return result as T;
    });
  }
}

export const jenaService = JenaService.getInstance();

*/