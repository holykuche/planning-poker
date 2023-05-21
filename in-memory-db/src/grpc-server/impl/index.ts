import "reflect-metadata";
import { container } from "config/inversify";
import { DatabaseService, GRPC_SERVER_TYPES } from "../api";
import DatabaseServiceImpl from "./DatabaseServiceImpl";

container.bind<DatabaseService>(GRPC_SERVER_TYPES.DatabaseService).to(DatabaseServiceImpl);