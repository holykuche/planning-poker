import "reflect-metadata";
import { container } from "config/inversify";
import { MIGRATION_TYPES, MigrationsExecutor } from "./api";

await container.get<MigrationsExecutor>(MIGRATION_TYPES.MigrationsExecutor)
    .execute("migration-scripts")
    .then(() => console.log("Migration completed successfully"));
