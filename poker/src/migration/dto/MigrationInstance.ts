import { TableDefinition } from "db-client/dto";
import { MigrationOperation } from "../enum";

type MigrationInstance =
    { operation: MigrationOperation.CreateTable, args: { tableName: string, definition: TableDefinition } }
    | { operation: MigrationOperation.DropTable, args: { tableName: string } }
    | { operation: MigrationOperation.Save, args: { tableName: string, entity: object } }
    | { operation: MigrationOperation.Delete, args: { tableName: string, key: string, value: string | number | boolean } };

export default MigrationInstance;