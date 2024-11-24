import { db } from '../index';
import { Person } from '../../models/person';
import { QueryResult } from '../types';
import { logger } from '../../utils/logger';

export class PersonRepository {
  private static instance: PersonRepository;

  private constructor() {}

  public static getInstance(): PersonRepository {
    if (!PersonRepository.instance) {
      PersonRepository.instance = new PersonRepository();
    }
    return PersonRepository.instance;
  }

  public async findAll(): Promise<Person[]> {
    try {
      const result = await db.query<Person>(
        'SELECT * FROM persons WHERE active = true'
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching persons:', error);
      throw error;
    }
  }

  public async findById(id: string): Promise<Person | null> {
    try {
      const result = await db.query<Person>(
        'SELECT * FROM persons WHERE id = ? AND active = true',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching person by id:', error);
      throw error;
    }
  }

  public async create(person: Omit<Person, 'id'>): Promise<Person> {
    try {
      const id = crypto.randomUUID();
      await db.query(
        `INSERT INTO persons (id, type, name, preferred_temp, room_id, active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, person.type, person.name, person.preferredTemp, person.room, true]
      );
      return this.findById(id) as Promise<Person>;
    } catch (error) {
      logger.error('Error creating person:', error);
      throw error;
    }
  }

  [... otros métodos CRUD ...]
}

export const personRepository = PersonRepository.getInstance();