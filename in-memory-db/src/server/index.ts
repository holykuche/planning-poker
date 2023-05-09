import {
    loadPackageDefinition,
    Server,
    sendUnaryData,
    ServerUnaryCall,
    ServiceClientConstructor,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { container } from "config/inversify";
import { Database, CORE_TYPES } from "core/api";

import {
    CreateTableRequest,
    BoolResponse,
    EntitiesResponse,
    EntityResponse,
    EntityRequest,
    TableFieldRequest,
    TableRequest,
} from "./dto";
import { serializeEntity, deserializeEntity } from "./util";

const PROTO_PATH = __dirname + "/db.proto";

const packageDefinition = loadSync(PROTO_PATH, {
    enums: String,
    keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const database = container.get<Database>(CORE_TYPES.Database);

const createTable = <T extends object>(
    call: ServerUnaryCall<CreateTableRequest<T>, void>,
    callback: sendUnaryData<void>
) => {
    const { table_name, definition } = call.request;

    let error: Error = null;

    try {
        database.createTable(table_name, definition);
    } catch (e) {
        error = e;
    }

    callback(error);
};

const dropTable = (
    call: ServerUnaryCall<TableRequest, void>,
    callback: sendUnaryData<void>
) => {
    const { table_name } = call.request;

    let error: Error = null;

    try {
        database.dropTable(table_name);
    } catch (e) {
        error = e;
    }

    callback(error);
};

const isTableExists = (
    call: ServerUnaryCall<TableRequest, BoolResponse>,
    callback: sendUnaryData<BoolResponse>
) => {
    const { table_name } = call.request;

    let response: BoolResponse = null;
    let error: Error = null;

    try {
        response = {
            result: database.isTableExists(table_name),
        };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const find = <T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, EntityResponse<T>>,
    callback: sendUnaryData<EntityResponse<T>>
) => {
    const { table_name, key, value } = call.request;

    let response: EntityResponse<T> = null;
    let error: Error = null;

    try {
        response = {
            result: serializeEntity(database.find(table_name, key, value)),
        };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const findMany = <T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, EntitiesResponse<T>>,
    callback: sendUnaryData<EntitiesResponse<T>>
) => {
    const { table_name, key, value } = call.request;

    let response: EntitiesResponse<T> = null;
    let error: Error = null;

    try {
        response = {
            result: database.findMany(table_name, key, value)
                .map(entity => ({ result: serializeEntity(entity) })),
        };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const findAll = <T extends object>(
    call: ServerUnaryCall<TableRequest, EntitiesResponse<T>>,
    callback: sendUnaryData<EntitiesResponse<T>>
) => {
    const { table_name } = call.request;

    let response: EntitiesResponse<T> = null;
    let error: Error = null;

    try {
        response = {
            result: database.findAll<T>(table_name)
                .map(entity => ({ result: serializeEntity(entity) })),
        };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const save = <T extends object>(
    call: ServerUnaryCall<EntityRequest<T>, EntityResponse<T>>,
    callback: sendUnaryData<EntityResponse<T>>
) => {
    const { table_name, entity } = call.request;

    let response: EntityResponse<T> = null;
    let error: Error = null;

    try {
        response = {
            result: serializeEntity(database.save(table_name, deserializeEntity(entity))),
        };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const del = <T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, void>,
    callback: sendUnaryData<void>
) => {
    const { table_name, key, value } = call.request;

    let error: Error = null;

    try {
        database.delete(table_name, key, value);
    } catch (e) {
        error = e;
    }

    callback(error);
};

export default () => {
    const server = new Server();

    server.addService((protoDescriptor.Database as ServiceClientConstructor).service, {
        createTable,
        dropTable,
        isTableExists,
        find,
        findMany,
        findAll,
        save,
        delete: del,
    });

    return server;
};
