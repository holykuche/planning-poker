import "reflect-metadata";
import { container } from "config/inversify";

import { DB_CLIENT_TYPES, DatabaseClient } from "../api";
import DatabaseClientImpl from "./DatabaseClientImpl";

container.bind<DatabaseClient>(DB_CLIENT_TYPES.DatabaseClient).to(DatabaseClientImpl);
