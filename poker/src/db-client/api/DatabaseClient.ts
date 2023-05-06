import { TableDefinition } from "../dto";

export default interface DatabaseClient {

    createTable(tableName: string, definition: TableDefinition): Promise<void>;

    dropTable(tableName: string): Promise<void>;

    isTableExists(tableName: string): Promise<boolean>;

    find<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T>;

    findMany<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T[]>;

    findAll<T extends object>(tableName: string): Promise<T[]>;

    save<T extends object>(tableName: string, entity: T): Promise<T>;

    delete<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<void>;

}
