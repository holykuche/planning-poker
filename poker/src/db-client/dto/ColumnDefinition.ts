import { ColumnDataType } from "../enum";

export default interface ColumnDefinition {

    type: ColumnDataType;

    required?: boolean;

    primary_key?: boolean;

}
