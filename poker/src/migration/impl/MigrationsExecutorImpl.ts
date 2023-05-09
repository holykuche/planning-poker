import { inject, injectable } from "inversify";
import { readdir } from "fs/promises";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

import { DatabaseClient, DB_CLIENT_TYPES } from "db-client/api";
import { ColumnDataType } from "db-client/enum";

import { MigrationsExecutor } from "../api";
import { MigrationOperation, TableName } from "../enum";
import {
    IncompatibleMigrationsError,
    MigrationHistoryTableAlreadyExistsError,
    UnknownMigrationsError,
    UnsuccessfulMigrationsExistError,
    UnsupportedMigrationOperation,
    MigrationExecutionError,
} from "../error";
import { MigrationHistoryRecord, MigrationInstance, RecordsAndFilenames, RecordsAndFilenamesAndHashes } from "../dto";

@injectable()
export default class MigrationsExecutorImpl implements MigrationsExecutor {

    @inject(DB_CLIENT_TYPES.DatabaseClient) private readonly dbClient: DatabaseClient;

    execute(migrationsDirname: string): Promise<void> {
        return this.initializeMigrationHistoryTable()
            .then(() => console.log(`${ TableName.MigrationHistory } table successfully initialized`))
            .catch(reason => {
                if (reason instanceof MigrationHistoryTableAlreadyExistsError) {
                    console.log(reason.message);
                } else {
                    throw reason;
                }
            })
            .then(() => this.prepareRecords())
            .then(MigrationsExecutorImpl.validateSuccess)
            .then(records => MigrationsExecutorImpl.prepareFilenames(migrationsDirname, records))
            .then(MigrationsExecutorImpl.validateExisting)
            .then(recordsAndFilenames => MigrationsExecutorImpl.prepareHashes(migrationsDirname, recordsAndFilenames))
            .then(MigrationsExecutorImpl.validateHashes)
            .then(recordsAndFilenamesAndHashes => this.executeMigrations(migrationsDirname, recordsAndFilenamesAndHashes));
    }

    private async initializeMigrationHistoryTable() {
        return this.dbClient.isTableExists(TableName.MigrationHistory)
            .then(isExists => {
                if (isExists) {
                    throw new MigrationHistoryTableAlreadyExistsError();
                }

                return this.dbClient.createTable(TableName.MigrationHistory, {
                    columns: {
                        id: { type: ColumnDataType.Number, primary_key: true },
                        file_name: { type: ColumnDataType.String, required: true },
                        hash: { type: ColumnDataType.String, required: true },
                        success: { type: ColumnDataType.Boolean, required: true },
                        failure_reason: { type: ColumnDataType.String },
                    },
                    index_by: [ "file_name", "hash" ],
                });
            });
    }

    private async prepareRecords() {
        return this.dbClient.findAll<MigrationHistoryRecord>(TableName.MigrationHistory);
    }

    private static async prepareFilenames(migrationsDirname: string, records: MigrationHistoryRecord[]) {
        return readdir(migrationsDirname).then(filenames => ({ records, filenames }));
    }

    private static prepareHashes(dirname: string, recordsAndFilenames: RecordsAndFilenames) {
        return {
            ...recordsAndFilenames,
            hashes: recordsAndFilenames.filenames
                .reduce((hashes, filename) => ({
                    ...hashes,
                    [ filename ]: createHash("md5")
                        .update(readFileSync(resolve(dirname, filename)))
                        .digest("hex"),
                }), {} as Record<string, string>),
        };
    }

    private static validateSuccess(records: MigrationHistoryRecord[]) {
        const unsuccessfulRecords = records.filter(r => !r.success);
        if (unsuccessfulRecords.length) {
            throw new UnsuccessfulMigrationsExistError(unsuccessfulRecords);
        }

        return records;
    }

    private static validateExisting(recordsAndFilenames: RecordsAndFilenames) {
        const { records, filenames } = recordsAndFilenames;

        const unknownRecords = records.filter(r => !filenames.find(fn => r.file_name === fn));
        if (unknownRecords.length) {
            throw new UnknownMigrationsError(unknownRecords);
        }

        return recordsAndFilenames;
    }

    private static validateHashes(recordsAndFilenamesAndHashes: RecordsAndFilenamesAndHashes) {
        const { records, hashes } = recordsAndFilenamesAndHashes;

        const incompatibleRecords = records.filter(r => r.hash !== hashes[ r.file_name ]);
        if (incompatibleRecords.length) {
            throw new IncompatibleMigrationsError(incompatibleRecords);
        }

        return recordsAndFilenamesAndHashes;
    }

    private executeMigration(fullFilename: string) {
        const migration: MigrationInstance<MigrationHistoryRecord> = require(fullFilename);
        const { operation, args } = migration;

        switch (operation) {
            case MigrationOperation.CreateTable:
                return this.dbClient.createTable(args.table_name, args.definition);
            case MigrationOperation.DropTable:
                return this.dbClient.dropTable(args.table_name);
            case MigrationOperation.Save:
                return this.dbClient.save(args.table_name, args.entity);
            case MigrationOperation.Delete:
                return this.dbClient.delete<Record<string, any>, any>(args.table_name, args.key, args.value);
            default:
                return Promise.reject(new UnsupportedMigrationOperation(operation));
        }
    }

    private async executeMigrations(dirname: string, recordsAndFilenamesAndHashes: RecordsAndFilenamesAndHashes) {
        const { records, filenames, hashes } = recordsAndFilenamesAndHashes;

        const sortedFilenames = filenames.sort((left, right) => left.localeCompare(right));

        for (const filename of sortedFilenames) {
            if (records.find(r => r.file_name === filename)) {
                return;
            }

            let failureReason: string;

            try {
                await this.executeMigration(resolve(dirname, filename));
                console.log(`Migration ${ filename } successfully applied`);
            } catch (error) {
                if (error instanceof Error) {
                    failureReason = error.message;
                } else if (typeof error === "string") {
                    failureReason = error;
                } else {
                    failureReason = "Unknown reason";
                }
            }

            await this.dbClient.save<MigrationHistoryRecord>(TableName.MigrationHistory, {
                file_name: filename,
                hash: hashes[ filename ],
                success: !failureReason,
                failure_reason: failureReason,
            });

            if (failureReason) throw new MigrationExecutionError(filename, failureReason);
        }
    };

}