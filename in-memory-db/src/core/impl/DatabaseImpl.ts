import { injectable } from "inversify";

import { Entity, TableDefinition } from "../dto";
import { TableInitializeError, TableOperationError } from "../error";
import { Database, Table } from "../api";

import TableImpl from "./TableImpl";

@injectable()
export default class DatabaseImpl implements Database {

    private readonly tables: Map<string, Table>;

    constructor() {
        this.tables = new Map<string, Table>();
    }

    createTable(tableName: string, definition: TableDefinition): void {
        if (this.tables.has(tableName)) {
            throw new TableInitializeError(tableName, `Table already exists.`);
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

    find(tableName: string, key: string, value: string): Entity {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table).find(key, value);
    }

    findMany(tableName: string, key: string, value: string): Entity[] {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table).findMany(key, value);
    }

    save(tableName: string, entity: Entity): Entity {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table).save(entity);
    }

    delete(tableName: string, key: string, value: string): void {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table).delete(key, value);
    }

    private checkTableExistence(tableName: string): void {
        if (!this.isTableExists(tableName)) {
            throw new TableOperationError(tableName, `Table doesn't exist.`);
        }
    }
}
