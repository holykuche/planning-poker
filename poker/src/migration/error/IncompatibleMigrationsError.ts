import { MigrationHistoryRecord } from "../dto";
import ExistingRecordsError from "./ExistingRecordsError";

export default class IncompatibleMigrationsError extends ExistingRecordsError {

    constructor(incompatibleRecords: MigrationHistoryRecord[]) {
        super("There are incompatible hashes of already executed migrations", incompatibleRecords);
        Object.setPrototypeOf(this, IncompatibleMigrationsError.prototype);
    }

}