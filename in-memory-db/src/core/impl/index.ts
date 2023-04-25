import "reflect-metadata";
import { container } from "inversify.config";
import { Database, CORE_TYPES } from "../api";
import DatabaseImpl from "./DatabaseImpl";

container.bind<Database>(CORE_TYPES.Database).to(DatabaseImpl);
