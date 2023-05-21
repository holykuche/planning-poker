import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import {
    BoolResponse,
    CreateTableRequest,
    EntitiesResponse, EntityRequest,
    EntityResponse,
    TableFieldRequest,
    TableRequest,
} from "../dto";

export default interface DatabaseGrpcService {

    createTable<T extends object>(
        call: ServerUnaryCall<CreateTableRequest<T>, void>,
        callback: sendUnaryData<void>,
    );

    dropTable(
        call: ServerUnaryCall<TableRequest, void>,
        callback: sendUnaryData<void>,
    );

    isTableExists(
        call: ServerUnaryCall<TableRequest, BoolResponse>,
        callback: sendUnaryData<BoolResponse>,
    );

    find<T extends object, K extends keyof T>(
        call: ServerUnaryCall<TableFieldRequest<T, K>, EntityResponse<T>>,
        callback: sendUnaryData<EntityResponse<T>>,
    );

    findMany<T extends object, K extends keyof T>(
        call: ServerUnaryCall<TableFieldRequest<T, K>, EntitiesResponse<T>>,
        callback: sendUnaryData<EntitiesResponse<T>>,
    );

    findAll<T extends object>(
        call: ServerUnaryCall<TableRequest, EntitiesResponse<T>>,
        callback: sendUnaryData<EntitiesResponse<T>>,
    );

    save<T extends object>(
        call: ServerUnaryCall<EntityRequest<T>, EntityResponse<T>>,
        callback: sendUnaryData<EntityResponse<T>>,
    );

    delete<T extends object, K extends keyof T>(
        call: ServerUnaryCall<TableFieldRequest<T, K>, void>,
        callback: sendUnaryData<void>,
    );
}