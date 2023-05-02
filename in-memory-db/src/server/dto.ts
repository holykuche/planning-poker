import { Entity, TableDefinition } from "core/dto";

export interface CreateTableRequest {
    tableName: string;
    definition: TableDefinition;
}

export interface TableRequest {
    tableName: string;
}

export interface TableFieldRequest {
    tableName: string;
    key: string;
    value: string;
}

export interface BoolResponse {
    result: boolean;
}

export interface EntityResponse {
    result: Entity;
}

export interface EntitiesResponse {
    result: Entity[];
}

export interface EntityRequest {
    tableName: string;
    entity: Entity;
}
