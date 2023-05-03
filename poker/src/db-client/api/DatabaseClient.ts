import { Entity, TableDefinition } from "../dto";

export default interface DatabaseClient {

    createTable(tableName: string, definition: TableDefinition): Promise<void>;

    dropTable(tableName: string): Promise<void>;

    isTableExists(tableName: string): Promise<boolean>;

    find(tableName: string, key: string, value: string): Promise<Entity>;

    findMany(tableName: string, key: string, value: string): Promise<Entity[]>;

    save(tableName: string, entity: Entity): Promise<Entity>;

    delete(tableName: string, key: string, value: string): Promise<void>;

}
