import { Entity, Options } from "../dto";

export default interface Database {

    createTable<E extends Entity, PK extends keyof E>(tableName: string, options: Options<E>): void;

    dropTable(tableName: string): void;

    find<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): E;

    findMany<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): E[];

    save<E extends Entity>(tableName: string, entity: E): E;

    delete<E extends Entity, K extends keyof E>(tableName: string, key: K, value: E[ K ]): void;

}
