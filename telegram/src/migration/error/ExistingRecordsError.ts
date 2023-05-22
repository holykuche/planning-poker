import { MigrationHistoryRecord } from "../dto";

export default abstract class ExistingRecordsError extends Error {

    protected constructor(description: string, records: MigrationHistoryRecord[]) {
        super(`${ description }:\n${ ExistingRecordsError.formatRecords(records) }`);
    }

    private static formatRecords(records: MigrationHistoryRecord[]) {
        return records
            .map(ExistingRecordsError.formatRecord)
            .join(",\n");
    }

    private static formatRecord(record: MigrationHistoryRecord) {
        return "{\n"
            + `  file_name: ${ record.file_name },\n`
            + `  success: ${ record.success },\n`
            + `  failure_reason: ${ record.failure_reason }\n`
            + "}";
    }

}
