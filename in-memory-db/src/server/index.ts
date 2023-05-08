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

const PROTO_PATH = __dirname + "/db.proto";

const packageDefinition = loadSync(PROTO_PATH, {
    enums: String,
    keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const database = container.get<Database>(CORE_TYPES.Database);

const createTable = (call: ServerUnaryCall<CreateTableRequest, void>, callback: sendUnaryData<void>) => {
    const { tableName, definition } = call.request;

    let error: Error = null;

    try {
        database.createTable(tableName, definition);
    } catch (e) {
        error = e;
    }

    callback(error);
};

const dropTable = (call: ServerUnaryCall<TableRequest, void>, callback: sendUnaryData<void>) => {
    const { tableName } = call.request;

    let error: Error = null;

    try {
        database.dropTable(tableName);
    } catch (e) {
        error = e;
    }

    callback(error);
};

const isTableExists = (call: ServerUnaryCall<TableRequest, BoolResponse>, callback: sendUnaryData<BoolResponse>) => {
    const { tableName } = call.request;

    let response: BoolResponse = null;
    let error: Error = null;

    try {
        response = { result: database.isTableExists(tableName) };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const find = (call: ServerUnaryCall<TableFieldRequest, EntityResponse>, callback: sendUnaryData<EntityResponse>) => {
    const { tableName, key, value } = call.request;

    let response: EntityResponse = null;
    let error: Error = null;

    try {
        response = { result: database.find(tableName, key, value) };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const findMany = (call: ServerUnaryCall<TableFieldRequest, EntitiesResponse>, callback: sendUnaryData<EntitiesResponse>) => {
    const { tableName, key, value } = call.request;

    let response: EntitiesResponse = null;
    let error: Error = null;

    try {
        response = { result: database.findMany(tableName, key, value) };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const findAll = (call: ServerUnaryCall<TableRequest, EntitiesResponse>, callback: sendUnaryData<EntitiesResponse>) => {
    const { tableName } = call.request;

    let response: EntitiesResponse = null;
    let error: Error = null;

    try {
        response = { result: database.findAll(tableName) };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const save = (call: ServerUnaryCall<EntityRequest, EntityResponse>, callback: sendUnaryData<EntityResponse>) => {
    const { tableName, entity } = call.request;

    let response: EntityResponse = null;
    let error: Error = null;

    try {
        response = { result: database.save(tableName, entity) };
    } catch (e) {
        error = e;
    }

    callback(error, response);
};

const del = (call: ServerUnaryCall<TableFieldRequest, void>, callback: sendUnaryData<void>) => {
    const { tableName, key, value } = call.request;

    let error: Error = null;

    try {
        database.delete(tableName, key, value);
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
