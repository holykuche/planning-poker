import { MigrationHistoryRecord } from "../dto";
import ExistingRecordsError from "./ExistingRecordsError";

export default class UnknownMigrationsError extends ExistingRecordsError {

    constructor(unknownRecords: MigrationHistoryRecord[]) {
        super("There are unknown already executed migrations", unknownRecords);
        Object.setPrototypeOf(this, UnknownMigrationsError.prototype);
    }

}