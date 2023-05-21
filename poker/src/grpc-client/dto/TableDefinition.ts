import ColumnDefinition from "./ColumnDefinition";

export default interface TableDefinition<T extends object> {

    columns: Record<keyof T, ColumnDefinition>;

    index_by?: (keyof T)[];

}
