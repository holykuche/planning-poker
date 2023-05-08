import { injectable } from "inversify";
import { loadPackageDefinition, ServiceClientConstructor, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { DatabaseClient } from "../api";
import { TableDefinition } from "../dto";

interface Result<T> {
    result: T;
}

@injectable()
export default class DatabaseClientImpl implements DatabaseClient {

    private readonly stub;

    constructor() {
        const PROTO_PATH = __dirname + "/db.proto";

        const packageDefinition = loadSync(PROTO_PATH, {
            enums: String,
            keepCase: true,
        });
        const protoDescriptor = loadPackageDefinition(packageDefinition);

        const ClientConstructor = protoDescriptor.Database as ServiceClientConstructor;
        this.stub = new ClientConstructor(`${ process.env.DB_IP }:${ process.env.DB_PORT }`, credentials.createInsecure());
    }

    createTable(tableName: string, definition: TableDefinition): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.CreateTable({ tableName, definition }, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    dropTable(tableName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.DropTable({ tableName }, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    isTableExists(tableName: string): Promise<boolean> {
        return new Promise<Result<boolean>>((resolve, reject) => {
            this.stub.IsTableExists({ tableName }, DatabaseClientImpl.callbackFactory<Result<boolean>>(resolve, reject));
        })
            .then(response => response.result);
    }

    find<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T> {
        return new Promise<Result<T>>((resolve, reject) => {
            this.stub.Find({ tableName, key, value }, DatabaseClientImpl.callbackFactory<Result<T>>(resolve, reject));
        })
            .then(response => response.result || null);
    }

    findMany<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<T[]> {
        return new Promise<Result<Result<T>[]>>((resolve, reject) => {
            this.stub.FindMany({ tableName, key, value }, DatabaseClientImpl.callbackFactory<Result<Result<T>[]>>(resolve, reject));
        })
            .then(response => (response?.result || []).map(({ result }) => result));
    }

    findAll<T extends object>(tableName: string): Promise<T[]> {
        return new Promise<Result<Result<T>[]>>((resolve, reject) => {
            this.stub.FindAll({ tableName }, DatabaseClientImpl.callbackFactory<Result<Result<T>[]>>(resolve, reject));
        })
            .then(response => (response?.result || []).map(({ result }) => result));
    }

    save<T extends object>(tableName: string, entity: T): Promise<T> {
        return new Promise<Result<T>>((resolve, reject) => {
            this.stub.Save({ tableName, entity }, DatabaseClientImpl.callbackFactory<Result<T>>(resolve, reject));
        })
            .then(response => response.result);
    }

    delete<T extends object, K extends keyof T>(tableName: string, key: K, value: T[ K ]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.Delete({ tableName, key, value }, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    private static callbackFactory<T>(resolve: (value: T) => void, reject: (error: Error) => void): (error: Error, value: T) => void {
        return (error, value) => error ? reject(error) : resolve(value);
    }

}