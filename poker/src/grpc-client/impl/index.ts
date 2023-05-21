import "reflect-metadata";
import { container } from "config/inversify";

import { GRPC_CLIENT_TYPES, DatabaseClient } from "../api";
import DatabaseClientImpl from "./DatabaseClientImpl";

container.bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient).to(DatabaseClientImpl);
