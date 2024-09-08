import {injectable} from 'inversify';

import {Database, Table} from '../api';
import {TableDefinition} from '../dto';
import {TableInitializeError, TableOperationError} from '../error';

import TableImpl from './TableImpl';

@injectable()
export default class DatabaseImpl implements Database {
  private readonly tables: Map<string, Table<object>>;

  constructor() {
    this.tables = new Map<string, Table<object>>();
  }

  createTable<T extends object>(
    tableName: string,
    definition: TableDefinition<T>
  ): void {
    if (this.tables.has(tableName)) {
      throw new TableInitializeError(tableName, 'Table already exists.');
    }

    this.tables.set(tableName, new TableImpl(tableName, definition));
  }

  dropTable(tableName: string): void {
    this.checkTableExistence(tableName);
    this.tables.delete(tableName);
  }

  isTableExists(tableName: string): boolean {
    return this.tables.has(tableName);
  }

  find<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): T {
    this.checkTableExistence(tableName);
    return (this.tables.get(tableName) as Table<T>).find(key, value);
  }

  findMany<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): T[] {
    this.checkTableExistence(tableName);
    return (this.tables.get(tableName) as Table<T>).findMany(key, value);
  }

  findAll<T extends object>(tableName: string): T[] {
    this.checkTableExistence(tableName);
    return (this.tables.get(tableName) as Table<T>).findAll();
  }

  save<T extends object>(tableName: string, entity: T): T {
    this.checkTableExistence(tableName);
    return (this.tables.get(tableName) as Table<T>).save(entity);
  }

  delete<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): void {
    this.checkTableExistence(tableName);
    return (this.tables.get(tableName) as Table<T>).delete(key, value);
  }

  private checkTableExistence(tableName: string): void {
    if (!this.isTableExists(tableName)) {
      throw new TableOperationError(tableName, "Table doesn't exist.");
    }
  }
}
