import { injectable } from "inversify";
import { loadPackageDefinition, ServiceClientConstructor, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { DatabaseClient } from "../api";
import { TableDefinition, Protobuf } from "../dto";

interface Result<T> {
    result: T;
}

@injectable()
export default class DatabaseClientImpl implements DatabaseClient {

    private readonly stub: InstanceType<ServiceClientConstructor>;

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

    createTable<T extends object>(table_name: string, definition: TableDefinition<T>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.CreateTable(
                { table_name, definition },
                DatabaseClientImpl.callbackFactory<void>(resolve, reject)
            );
        });
    }

    dropTable(table_name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.DropTable(
                { table_name },
                DatabaseClientImpl.callbackFactory<void>(resolve, reject)
            );
        });
    }

    isTableExists(table_name: string): Promise<boolean> {
        return new Promise<Result<boolean>>((resolve, reject) => {
            this.stub.IsTableExists(
                { table_name },
                DatabaseClientImpl.callbackFactory<Result<boolean>>(resolve, reject)
            );
        })
            .then(response => response.result);
    }

    find<T extends object, K extends keyof T>(table_name: string, key: K, value: T[ K ]): Promise<T> {
        return new Promise<Result<Protobuf.Entity<T>>>((resolve, reject) => {
            this.stub.Find(
                { table_name, key, value },
                DatabaseClientImpl.callbackFactory<Result<Protobuf.Entity<T>>>(resolve, reject)
            );
        })
            .then(response => DatabaseClientImpl.deserializeEntity(response.result) || null);
    }

    findMany<T extends object, K extends keyof T>(table_name: string, key: K, value: T[ K ]): Promise<T[]> {
        return new Promise<Result<Result<Protobuf.Entity<T>>[]>>((resolve, reject) => {
            this.stub.FindMany(
                { table_name, key, value },
                DatabaseClientImpl.callbackFactory<Result<Result<Protobuf.Entity<T>>[]>>(resolve, reject)
            );
        })
            .then(response =>
                (response?.result || [])
                    .map(({ result }) => DatabaseClientImpl.deserializeEntity(result))
            );
    }

    findAll<T extends object>(table_name: string): Promise<T[]> {
        return new Promise<Result<Result<Protobuf.Entity<T>>[]>>((resolve, reject) => {
            this.stub.FindAll(
                { table_name },
                DatabaseClientImpl.callbackFactory<Result<Result<Protobuf.Entity<T>>[]>>(resolve, reject)
            );
        })
            .then(response =>
                (response?.result || [])
                    .map(({ result }) => DatabaseClientImpl.deserializeEntity(result))
            );
    }

    save<T extends object>(table_name: string, entity: T): Promise<T> {
        return new Promise<Result<Protobuf.Entity<T>>>((resolve, reject) => {
            this.stub.Save(
                { table_name, entity: DatabaseClientImpl.serializeEntity(entity) },
                DatabaseClientImpl.callbackFactory<Result<Protobuf.Entity<T>>>(resolve, reject)
            );
        })
            .then(response => DatabaseClientImpl.deserializeEntity(response.result));
    }

    delete<T extends object, K extends keyof T>(table_name: string, key: K, value: T[ K ]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stub.Delete({ table_name, key, value }, DatabaseClientImpl.callbackFactory<void>(resolve, reject));
        });
    }

    private static callbackFactory<T>(resolve: (value: T) => void, reject: (error: Error) => void): (error: Error, value: T) => void {
        return (error, value) => error ? reject(error) : resolve(value);
    }

    private static serializeEntity<T extends object>(entity: T): Protobuf.Entity<T> {
        return Object.entries(entity)
            .reduce((pe, [ key, value ]) => ({
                ...pe,
                [ key ]:
                    typeof value === "string" ? { string_value: value }
                    : typeof value === "number" ? { int_value: value }
                    : typeof value === "boolean" ? { bool_value: value }
                    : null,
            }), {} as Protobuf.Entity<T>);
    }

    private static deserializeEntity<T extends object>(protobufEntity: Protobuf.Entity<T>): T {
        return Object.entries<Protobuf.Entity<T>[ keyof Protobuf.Entity<T> ]>(protobufEntity)
            .reduce((e, [ key, value ]) => ({
                ...e,
                [ key ]:
                    DatabaseClientImpl.isProtobufString(value) ? value.string_value
                    : DatabaseClientImpl.isProtobufNumber(value) ? value.int_value
                    : DatabaseClientImpl.isProtobufBoolean(value) ? value.bool_value ?? false
                    : null,
            }), {} as T);
    }

    private static isProtobufString(value: any): value is Protobuf.StringValue {
        return typeof value.string_value === "string";
    }

    private static isProtobufNumber(value: any): value is Protobuf.IntValue {
        return typeof value.int_value === "number";
    }

    private static isProtobufBoolean(value: any): value is Protobuf.BoolValue {
        return typeof value.bool_value === "boolean";
    }

}