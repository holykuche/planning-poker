export default interface MigrationHistoryRecord {
    id?: number;
    file_name: string;
    hash: string;
    success: boolean;
    failure_reason?: string;
}
