import { loadPackageDefinition, Server, ServiceClientConstructor, ServerCredentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import dbServiceImpl from "./dbServiceImpl";

const PROTO_PATH = __dirname + "/db.proto";

const packageDefinition = loadSync(PROTO_PATH, {
    enums: String,
    keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const server = new Server();
server.addService((protoDescriptor.Database as ServiceClientConstructor).service, dbServiceImpl);
server.bindAsync(`0.0.0.0:${ process.env.DB_PORT }`, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`The server has successfully started on port ${ process.env.DB_PORT }`);
});