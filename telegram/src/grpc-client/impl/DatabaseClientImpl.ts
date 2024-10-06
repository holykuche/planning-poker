import {
  loadPackageDefinition,
  ServiceClientConstructor,
  credentials,
} from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';
import {injectable} from 'inversify';

import {DatabaseClient} from '../api';
import {TableDefinition, Protobuf} from '../entity';
import {DatabaseGrpcClientRequestError} from '../error';
import {EntitySerializer} from '../util';

interface Result<T> {
  result: T;
}

@injectable()
export default class DatabaseClientImpl implements DatabaseClient {
  private readonly stub: InstanceType<ServiceClientConstructor>;

  constructor() {
    const PROTO_PATH = __dirname + '/db.proto';

    const packageDefinition = loadSync(PROTO_PATH, {
      enums: String,
      keepCase: true,
    });
    const protoDescriptor = loadPackageDefinition(packageDefinition);

    const ClientConstructor =
      protoDescriptor.Database as ServiceClientConstructor;
    this.stub = new ClientConstructor(
      `${process.env.DB_IP}:${process.env.DB_PORT}`,
      credentials.createInsecure()
    );
  }

  createTable<T extends object>(
    table_name: string,
    definition: TableDefinition<T>
  ): Promise<void> {
    const methodName = 'CreateTable';
    const request = {table_name, definition};

    return new Promise<void>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<void>(resolve, reject)
      );
    }).catch(error =>
      DatabaseClientImpl.handleError(methodName, request, error)
    );
  }

  dropTable(table_name: string): Promise<void> {
    const methodName = 'DropTable';
    const request = {table_name};

    return new Promise<void>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<void>(resolve, reject)
      );
    }).catch(error =>
      DatabaseClientImpl.handleError(methodName, request, error)
    );
  }

  isTableExists(table_name: string): Promise<boolean> {
    const methodName = 'IsTableExists';
    const request = {table_name};

    return new Promise<Result<boolean>>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<Result<boolean>>(resolve, reject)
      );
    })
      .then(response => response.result)
      .catch(error =>
        DatabaseClientImpl.handleError(methodName, request, error)
      );
  }

  find<T extends object, K extends keyof T>(
    table_name: string,
    key: K,
    value: T[K]
  ): Promise<T> {
    const methodName = 'Find';
    const request = {table_name, key, value};

    return new Promise<Result<Protobuf.Entity<T>>>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<Result<Protobuf.Entity<T>>>(
          resolve,
          reject
        )
      );
    })
      .then(response => EntitySerializer.deserialize(response.result))
      .catch(error =>
        DatabaseClientImpl.handleError(methodName, request, error)
      );
  }

  findMany<T extends object, K extends keyof T>(
    table_name: string,
    key: K,
    value: T[K]
  ): Promise<T[]> {
    const methodName = 'FindMany';
    const request = {table_name, key, value};

    return new Promise<Result<Result<Protobuf.Entity<T>>[]>>(
      (resolve, reject) => {
        this.stub[methodName](
          request,
          DatabaseClientImpl.callbackFactory<
            Result<Result<Protobuf.Entity<T>>[]>
          >(resolve, reject)
        );
      }
    )
      .then(response =>
        (response?.result || []).map(({result}) =>
          EntitySerializer.deserialize(result)
        )
      )
      .catch(error =>
        DatabaseClientImpl.handleError(methodName, request, error)
      );
  }

  findAll<T extends object>(table_name: string): Promise<T[]> {
    const methodName = 'FindAll';
    const request = {table_name};

    return new Promise<Result<Result<Protobuf.Entity<T>>[]>>(
      (resolve, reject) => {
        this.stub[methodName](
          request,
          DatabaseClientImpl.callbackFactory<
            Result<Result<Protobuf.Entity<T>>[]>
          >(resolve, reject)
        );
      }
    )
      .then(response =>
        (response?.result || []).map(({result}) =>
          EntitySerializer.deserialize(result)
        )
      )
      .catch(error =>
        DatabaseClientImpl.handleError(methodName, request, error)
      );
  }

  save<T extends object>(table_name: string, entity: T): Promise<T> {
    const methodName = 'Save';
    const request = {table_name, entity: EntitySerializer.serialize(entity)};

    return new Promise<Result<Protobuf.Entity<T>>>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<Result<Protobuf.Entity<T>>>(
          resolve,
          reject
        )
      );
    })
      .then(response => EntitySerializer.deserialize(response.result))
      .catch(error =>
        DatabaseClientImpl.handleError(methodName, request, error)
      );
  }

  delete<T extends object, K extends keyof T>(
    table_name: string,
    key: K,
    value: T[K]
  ): Promise<void> {
    const methodName = 'Delete';
    const request = {table_name, key, value};

    return new Promise<void>((resolve, reject) => {
      this.stub[methodName](
        request,
        DatabaseClientImpl.callbackFactory<void>(resolve, reject)
      );
    }).catch(error =>
      DatabaseClientImpl.handleError(methodName, request, error)
    );
  }

  private static callbackFactory<T>(
    resolve: (value: T) => void,
    reject: (error: Error) => void
  ): (error: Error, value: T) => void {
    return (error, value) => (error ? reject(error) : resolve(value));
  }

  private static handleError<TReturn>(
    methodName: string,
    request: object,
    error: unknown
  ): TReturn {
    if (error instanceof Error) {
      throw new DatabaseGrpcClientRequestError(
        methodName,
        request,
        error.message
      );
    } else {
      throw error;
    }
  }
}
