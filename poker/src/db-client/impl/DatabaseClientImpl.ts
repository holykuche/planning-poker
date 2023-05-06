import { injectable } from "inversify";
import { loadPackageDefinition, ServiceClientConstructor, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { DatabaseClient } from "../api";
import { TableDefinition } from "../dto";

@injectable()
export default class DatabaseClientImpl implements DatabaseClient {

    private readonly client;

    constructor() {
        const PROTO_PATH = __dirname + "/db.proto";

        const packageDefinition = loadSync(PROTO_PATH, {
            enums: String,
            keepCase: true,
        });
        const protoDescriptor = loadPackageDefinition(packageDefinition);

        const ClientConstructor = protoDescriptor.Database as ServiceClientConstructor;
        this.client = new ClientConstructor(`${ process.env.DB_IP }:${ process.env.DB_PORT }`, credentials.createInsecure());
    }

    createTable(tableName: string, definition: TableDefinition): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.CreateTable(tableName, definition, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    dropTable(tableName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.DropTable(tableName, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    isTableExists(tableName: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.IsTableExists(tableName, DatabaseClientImpl.callbackFactory<boolean>(resolve, reject));
        });
    }

    find<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.Find(tableName, key, value, DatabaseClientImpl.callbackFactory<T>(resolve, reject));
        });
    }

    findMany<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.client.FindMany(tableName, key, value, DatabaseClientImpl.callbackFactory<T[]>(resolve, reject));
        });
    }

    findAll<T extends object>(tableName: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.client.FindAll(tableName, DatabaseClientImpl.callbackFactory<T[]>(resolve, reject));
        });
    }

    save<T extends object>(tableName: string, entity: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.Save(tableName, entity, DatabaseClientImpl.callbackFactory<T>(resolve, reject));
        });
    }

    delete<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.Delete(tableName, key, value, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    private static callbackFactory<T>(resolve: (value: T) => void, reject: (error: Error) => void): (error: Error, value: T) => void {
        return (error, value) => error ? reject(error) : resolve(value);
    }

}