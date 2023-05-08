import { ServerCredentials } from "@grpc/grpc-js";
import getServer from "./server";

const server = getServer();
server.bindAsync(`0.0.0.0:${ process.env.DB_PORT }`, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`The server has successfully started on port ${ process.env.DB_PORT }`);
});
