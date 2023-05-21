import { TableDefinition } from "core/dto";

export default interface CreateTableRequest<T extends object> {
    table_name: string;
    definition: TableDefinition<T>;
}