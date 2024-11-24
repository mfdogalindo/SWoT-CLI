export interface DatabaseConfig {
   host: string;
   port: number;
   user: string;
   password: string;
   database: string;
 }
 
 export interface QueryResult<T> {
   rows: T[];
   rowCount: number;
 }
 
 export interface ConnectionPool {
   totalCount: number;
   idleCount: number;
   waitingCount: number;
 }