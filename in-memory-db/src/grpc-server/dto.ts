import { TableDefinition } from "core/dto";

export interface CreateTableRequest<T extends object> {
    table_name: string;
    definition: TableDefinition<T>;
}

export interface TableRequest {
    table_name: string;
}

export interface TableFieldRequest<T, K extends keyof T> {
    table_name: string;
    key: K;
    value: T[ K ];
}

export interface BoolResponse {
    result: boolean;
}

export interface EntityResponse<T extends object> {
    result: Protobuf.Entity<T>;
}

export interface EntitiesResponse<T extends object> {
    result: EntityResponse<T>[];
}

export interface EntityRequest<T extends object> {
    table_name: string;
    entity: Protobuf.Entity<T>;
}

export namespace Protobuf {

    export type Entity<T extends object> = {
        [ K in keyof T ]: Value<T, K>
    };

    export type IntValue = { int_value: number };

    export type StringValue = { string_value: string };

    export type BoolValue = { bool_value: boolean };

    export type Value<T extends object, K extends keyof T> =
        T[ K ] extends number ? IntValue
        : T[ K ] extends string ? StringValue
        : T[ K ] extends boolean ? BoolValue
        : never

}
