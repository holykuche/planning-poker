import ColumnDefinition from "./ColumnDefinition";

export default interface TableDefinition {

    columns: Record<string, ColumnDefinition>;

    indexBy?: string[];

}
