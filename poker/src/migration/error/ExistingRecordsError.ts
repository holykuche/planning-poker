import { MigrationHistoryRecord } from "../dto";

export default abstract class ExistingRecordsError extends Error {

    protected constructor(description: string, records: MigrationHistoryRecord[]) {
        super(`${ description }: ${ ExistingRecordsError.formatRecords(records) }`);
    }

    private static formatRecords(records: MigrationHistoryRecord[]) {
        return records.map(r => r.file_name).join(", ");
    }

}
