import { TableName } from "../enum";

export default class MigrationHistoryTableAlreadyExistsError extends Error {

    constructor() {
        super(`${ TableName.MigrationHistory } table already exists`);
        Object.setPrototypeOf(this, MigrationHistoryTableAlreadyExistsError.prototype);
    }


}
