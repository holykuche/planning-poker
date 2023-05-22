import { container } from "config/inversify";
import { MIGRATION_TYPES, MigrationsExecutor } from "../api";
import MigrationsExecutorImpl from "./MigrationsExecutorImpl";

container.bind<MigrationsExecutor>(MIGRATION_TYPES.MigrationsExecutor).to(MigrationsExecutorImpl);
