import "reflect-metadata";
import { resolve } from "path";

import { container } from "config/inversify";
import { MIGRATION_TYPES, MigrationsExecutor } from "./api";

container.get<MigrationsExecutor>(MIGRATION_TYPES.MigrationsExecutor)
    .execute(resolve(__dirname, "migration-scripts"))
    .then(() => console.log("Migration completed successfully"))
    .catch(error => console.error(error));
