import {TableDefinition} from '../dto';

export default interface Database {
  createTable<T extends object>(
    tableName: string,
    definition: TableDefinition<T>
  ): void;

  dropTable(tableName: string): void;

  isTableExists(tableName: string): boolean;

  find<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): T;

  findMany<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): T[];

  findAll<T extends object>(tableName: string): T[];

  save<T extends object>(tableName: string, entity: T): T;

  delete<T extends object, K extends keyof T>(
    tableName: string,
    key: K,
    value: T[K]
  ): void;
}
