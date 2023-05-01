import { Entity, TableDefinition } from "../dto";

export default interface Database {

    createTable(tableName: string, definition: TableDefinition): void;

    dropTable(tableName: string): void;

    isTableExists(tableName: string): boolean;

    find(tableName: string, key: string, value: string): Entity;

    findMany(tableName: string, key: string, value: string): Entity[];

    save(tableName: string, entity: Entity): Entity;

    delete(tableName: string, key: string, value: string): void;

}
