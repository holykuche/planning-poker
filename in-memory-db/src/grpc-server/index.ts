import 'reflect-metadata';
import {
  loadPackageDefinition,
  Server,
  ServiceClientConstructor,
  ServerCredentials,
} from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';

import {container} from '@/config/inversify';

import {DatabaseGrpcService, GRPC_SERVER_TYPES} from './api';

const PROTO_PATH = __dirname + '/db.proto';

const packageDefinition = loadSync(PROTO_PATH, {
  enums: String,
  keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const databaseService = container.get<DatabaseGrpcService>(
  GRPC_SERVER_TYPES.DatabaseGrpcService
);

const server = new Server();
server.addService(
  (protoDescriptor.Database as ServiceClientConstructor).service,
  {
    CreateTable: databaseService.createTable,
    DropTable: databaseService.dropTable,
    IsTableExists: databaseService.isTableExists,
    Find: databaseService.find,
    FindMany: databaseService.findMany,
    FindAll: databaseService.findAll,
    Save: databaseService.save,
    Delete: databaseService.delete,
  }
);
server.bindAsync(
  `0.0.0.0:${process.env.DB_PORT}`,
  ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error(
        `gRPC server couldn't start on port ${port}: ${JSON.stringify(error, null, 2)}`
      );
    } else {
      console.log(`gRPC server has successfully started on port ${port}`);
    }
  }
);
