import {ServerUnaryCall, sendUnaryData} from '@grpc/grpc-js';
import {injectable, inject} from 'inversify';

import {Database, CORE_TYPES} from '@/core/api';

import {DatabaseGrpcService} from '../api';
import {
  CreateTableRequest,
  BoolResponse,
  EntitiesResponse,
  EntityResponse,
  EntityRequest,
  TableFieldRequest,
  TableRequest,
} from '../dto';
import {EntitySerializer} from '../util';

@injectable()
export default class DatabaseGrpcServiceImpl implements DatabaseGrpcService {
  @inject(CORE_TYPES.Database) private readonly database: Database;

  constructor() {
    this.createTable = this.createTable.bind(this);
    this.dropTable = this.dropTable.bind(this);
    this.isTableExists = this.isTableExists.bind(this);
    this.find = this.find.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findMany = this.findMany.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
  }

  createTable<T extends object>(
    call: ServerUnaryCall<CreateTableRequest<T>, void>,
    callback: sendUnaryData<void>
  ) {
    const {table_name, definition} = call.request;

    let error: Error = null;

    try {
      this.database.createTable(table_name, definition);
    } catch (e) {
      error = e;
    }

    callback(error);
  }

  dropTable(
    call: ServerUnaryCall<TableRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {table_name} = call.request;

    let error: Error = null;

    try {
      this.database.dropTable(table_name);
    } catch (e) {
      error = e;
    }

    callback(error);
  }

  isTableExists(
    call: ServerUnaryCall<TableRequest, BoolResponse>,
    callback: sendUnaryData<BoolResponse>
  ) {
    const {table_name} = call.request;

    let response: BoolResponse = null;
    let error: Error = null;

    try {
      response = {
        result: this.database.isTableExists(table_name),
      };
    } catch (e) {
      error = e;
    }

    callback(error, response);
  }

  find<T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, EntityResponse<T>>,
    callback: sendUnaryData<EntityResponse<T>>
  ) {
    const {table_name, key, value} = call.request;

    let response: EntityResponse<T> = null;
    let error: Error = null;

    try {
      response = {
        result: EntitySerializer.serialize(
          this.database.find(
            table_name,
            key,
            EntitySerializer.deserializeValue(value)
          )
        ),
      };
    } catch (e) {
      error = e;
    }

    callback(error, response);
  }

  findAll<T extends object>(
    call: ServerUnaryCall<TableRequest, EntitiesResponse<T>>,
    callback: sendUnaryData<EntitiesResponse<T>>
  ) {
    const {table_name} = call.request;

    let response: EntitiesResponse<T> = null;
    let error: Error = null;

    try {
      response = {
        result: this.database
          .findAll<T>(table_name)
          .map(entity => ({result: EntitySerializer.serialize(entity)})),
      };
    } catch (e) {
      error = e;
    }

    callback(error, response);
  }

  findMany<T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, EntitiesResponse<T>>,
    callback: sendUnaryData<EntitiesResponse<T>>
  ) {
    const {table_name, key, value} = call.request;

    let response: EntitiesResponse<T> = null;
    let error: Error = null;

    try {
      response = {
        result: this.database
          .findMany(table_name, key, EntitySerializer.deserializeValue(value))
          .map(entity => ({result: EntitySerializer.serialize(entity)})),
      };
    } catch (e) {
      error = e;
    }

    callback(error, response);
  }

  save<T extends object>(
    call: ServerUnaryCall<EntityRequest<T>, EntityResponse<T>>,
    callback: sendUnaryData<EntityResponse<T>>
  ) {
    const {table_name, entity} = call.request;

    let response: EntityResponse<T> = null;
    let error: Error = null;

    try {
      response = {
        result: EntitySerializer.serialize(
          this.database.save(table_name, EntitySerializer.deserialize(entity))
        ),
      };
    } catch (e) {
      error = e;
    }

    callback(error, response);
  }

  delete<T extends object, K extends keyof T>(
    call: ServerUnaryCall<TableFieldRequest<T, K>, void>,
    callback: sendUnaryData<void>
  ) {
    const {table_name, key, value} = call.request;

    let error: Error = null;

    try {
      this.database.delete(
        table_name,
        key,
        EntitySerializer.deserializeValue(value)
      );
    } catch (e) {
      error = e;
    }

    callback(error);
  }
}
