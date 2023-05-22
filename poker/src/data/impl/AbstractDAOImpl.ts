import { injectable, inject } from "inversify";
import { DatabaseClient, GRPC_CLIENT_TYPES } from "grpc-client/api";

import { TableName } from "../enum";

@injectable()
export default abstract class AbstractDAOImpl<T extends object> {

    @inject(GRPC_CLIENT_TYPES.DatabaseClient) dbClient: DatabaseClient;

    constructor(private readonly tableName: TableName) {}

    find<K extends keyof T>(key: K, value: T[ K ]): Promise<T> {
        return this.dbClient.find(this.tableName, key, value);
    }

    findMany<K extends keyof T>(key: K, value: T[ K ]): Promise<T[]> {
        return this.dbClient.findMany(this.tableName, key, value);
    }

    save(entity: T): Promise<T> {
        return this.dbClient.save(this.tableName, entity);
    }

    delete<K extends keyof T>(key: K, value: T[ K ]): Promise<void> {
        return this.dbClient.delete(this.tableName, key, value);
    }

}
