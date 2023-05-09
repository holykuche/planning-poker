import { TableDefinition } from "db-client/dto";
import { MigrationOperation } from "../enum";

type MigrationInstance<T extends object> =
    { operation: MigrationOperation.CreateTable, args: { table_name: string, definition: TableDefinition<T> } }
    | { operation: MigrationOperation.DropTable, args: { table_name: string } }
    | { operation: MigrationOperation.Save, args: { table_name: string, entity: T } }
    | { operation: MigrationOperation.Delete, args: { table_name: string, key: keyof T, value: T[ keyof T ] } };

export default MigrationInstance;