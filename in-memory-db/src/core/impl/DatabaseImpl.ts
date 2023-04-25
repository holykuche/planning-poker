import { injectable } from "inversify";

import { Entity, Options } from "../dto";
import { Database, Table } from "../api";

import TableImpl from "./TableImpl";

@injectable()
export default class DatabaseImpl implements Database {

    private readonly tables: Map<string, Table<unknown>>;

    constructor() {
        this.tables = new Map<string, TableImpl<unknown>>()
    }

    createTable<E extends Entity, PK extends keyof E>(tableName: string, options: Options<E>): void {
        if (this.tables.has(tableName)) {
            throw new Error(`Table with name "${tableName}" already exists`);
        }

        this.tables.set(tableName, new TableImpl<E>(options));
    }

    dropTable(tableName: string): void {
        this.checkTableExistence(tableName);
        this.tables.delete(tableName);
    }

    find<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): E {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table<E>).find(key, value);
    }

    findMany<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): E[] {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table<E>).findMany(key, value);
    }

    save<E extends Entity>(tableName: string, entity: E): E {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table<E>).save(entity);
    }

    delete<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): void {
        this.checkTableExistence(tableName);
        return (this.tables.get(tableName) as Table<E>).delete(key, value);
    }

    private checkTableExistence(tableName: string): void {
        if (!this.tables.has(tableName)) {
            throw new Error(`Table with name "${tableName}" doesn't exist`);
        }
    }
}
