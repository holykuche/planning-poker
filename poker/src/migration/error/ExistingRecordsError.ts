import { MigrationHistoryRecord } from "../dto";

export default abstract class ExistingRecordsError extends Error {

    protected constructor(description: string, records: MigrationHistoryRecord[]) {
        super(`${ description }: ${ ExistingRecordsError.formatRecords(records) }`);
        Object.setPrototypeOf(this, ExistingRecordsError.prototype);
    }

    private static formatRecords(records: MigrationHistoryRecord[]) {
        return records.map(r => r.file_name).join(", ");
    }

}
