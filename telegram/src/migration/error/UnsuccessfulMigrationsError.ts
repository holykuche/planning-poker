import { MigrationHistoryRecord } from "../dto";
import ExistingRecordsError from "./ExistingRecordsError";

export default class UnsuccessfulMigrationsError extends ExistingRecordsError {

    constructor(unsuccessfulRecords: MigrationHistoryRecord[]) {
        super("There are already executed unsuccessful migrations", unsuccessfulRecords);
        Object.setPrototypeOf(this, UnsuccessfulMigrationsError.prototype);
    }

}
