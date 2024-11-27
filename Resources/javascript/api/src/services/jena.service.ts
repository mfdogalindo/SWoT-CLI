// src/services/jena.service.ts

import axios, { AxiosError } from "axios";
import { logger } from "../utils/logger.service";
import { config } from "../config";
import { on } from "events";

export class JenaService {

  async initialize(): Promise<void> {
    try {
      await this.createDataset(`${config.jena.dataset}`, true);
      await this.createDataset(`${config.jena.dataset}`);
      logger.info('Jena service initialized');
    } catch (error) {
      logger.error('Error initializing Jena service:', error);
      throw error;
    }
  }

  async query(datasetName: string, sparqlQuery: string, onMemory: boolean = false): Promise<any> {
    datasetName = onMemory ? `${datasetName}-memory` : datasetName;
    try {
      const response = await axios.post(
        `${config.jena.host}/${datasetName}/query`,
        sparqlQuery,
        {
          headers: {
            'Content-Type': 'application/sparql-query',
            Accept: 'application/json',
            ...this.getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Error executing SPARQL query:`, error);
      throw error;
    }
  }

  async update(datasetName: string, sparqlUpdate: string, onMemory: boolean = false): Promise<void> {
    datasetName = onMemory ? `${datasetName}-memory` : datasetName;
    try {
      await axios.post(
        `${config.jena.host}/${datasetName}/update`,
        sparqlUpdate,
        {
          headers: {
            'Content-Type': 'application/sparql-update',
            ...this.getAuthHeader(),
          },
        }
      );
    } catch (error) {
      logger.error(`Error executing SPARQL update:`, error);
      throw error;
    }
  }

  async addData(datasetName: string, turtleData: string, onMemory : boolean = false): Promise<any> {
    datasetName = onMemory ? `${datasetName}-memory` : datasetName;
    return axios.post(
        `${config.jena.host}/${datasetName}/data`,
        turtleData,
        {
          headers: {
            'Content-Type': 'text/turtle',
            ...this.getAuthHeader(),
          },
        }
      ).catch((err) => {
        logger.error('Error adding turtle data: {}', err?.message ?? err);
        throw err.message;
      }
      ).then((response) => {
        return response.data;
      });
    
  }

  private getAuthHeader(): any {
    return {
      ...(config.jena.username && {
        Authorization: `Basic ${Buffer.from(
          `${config.jena.username}:${config.jena.password}`
        ).toString('base64')}`,
      }),
    };
  }

  async createDataset(datasetName: string, onMemory: boolean = false): Promise<boolean> {
    try {
      datasetName = onMemory ? `${datasetName}-memory` : datasetName;
      const exists = await this.datasetExists(datasetName);
      if (exists) {
        logger.info(`Dataset {} already exists`, datasetName);
        return true;
      }

      const response = await axios.post(
        `${config.jena.host}/$/datasets`,
        {
          dbType: onMemory ? 'mem' : 'tdb2',
          dbName: datasetName,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...this.getAuthHeader()
          }
        }
      ).catch((err) => {
        logger.error('Error creating dataset: {}', err?.message ?? err);
        throw err.message;
      });

      if (response.status === 201 || response.status === 200) {
        logger.info(`Dataset {} created`, datasetName);
        return true;
      }

      return false;
    }
    catch (error) {
      throw error;
    }
  }

  private async datasetExists(datasetName: string): Promise<boolean> {
    return axios.get(
        `${config.jena.host}/$/datasets/${datasetName}`,
        {
          headers: this.getAuthHeader(),
          validateStatus: (status) => status === 200 || status === 404,
        }
      ).then((response) => {
        return response.status === 200;
      }
      ).catch((err) => {
        logger.error('Error checking dataset: {}', err?.message ?? err);
        throw err.message;
      });
    }
}


// Singleton instance of JenaService
export const jenaService = new JenaService();