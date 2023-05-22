import MigrationHistoryRecord from "./MigrationHistoryRecord";

export default interface RecordsAndFilenames {
    records: MigrationHistoryRecord[];
    filenames: string[];
}
