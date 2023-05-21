import "reflect-metadata";
import { loadPackageDefinition, Server, ServiceClientConstructor, ServerCredentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { container } from "config/inversify";
import { DatabaseGrpcService, GRPC_SERVER_TYPES } from "./api";

const PROTO_PATH = __dirname + "/db.proto";

const packageDefinition = loadSync(PROTO_PATH, {
    enums: String,
    keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const databaseService = container.get<DatabaseGrpcService>(GRPC_SERVER_TYPES.DatabaseGrpcService);

const server = new Server();
server.addService((protoDescriptor.Database as ServiceClientConstructor).service, {
    createTable: databaseService.createTable,
    dropTable: databaseService.dropTable,
    isTableExists: databaseService.isTableExists,
    find: databaseService.find,
    findMany: databaseService.findMany,
    findAll: databaseService.findAll,
    save: databaseService.save,
    delete: databaseService.delete,
});
server.bindAsync(`0.0.0.0:${ process.env.DB_PORT }`, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`The server has successfully started on port ${ process.env.DB_PORT }`);
});