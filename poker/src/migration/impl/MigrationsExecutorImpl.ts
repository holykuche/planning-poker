import { injectable, inject } from "inversify";
import { readdir } from "fs/promises";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { fork } from "child_process";

import { DatabaseClient, DB_CLIENT_TYPES } from "db-client/api";
import { ColumnDataType } from "db-client/enum";

import { MigrationsExecutor } from "../api";
import { TableName } from "../enum";
import {
    MigrationHistoryTableAlreadyExistsError,
    UnsuccessfulMigrationsExistError,
    UnknownMigrationsError,
    IncompatibleMigrationsError,
} from "../error";
import { MigrationHistoryRecord, RecordsAndFilenames, RecordsAndFilenamesAndHashes } from "../dto";

@injectable()
export default class MigrationsExecutorImpl implements MigrationsExecutor {

    @inject(DB_CLIENT_TYPES.DatabaseClient) private readonly DbClient: DatabaseClient

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
            .then(this.prepareRecords)
            .then(MigrationsExecutorImpl.validateSuccess)
            .then(records => MigrationsExecutorImpl.prepareFilenames(migrationsDirname, records))
            .then(MigrationsExecutorImpl.validateExisting)
            .then(MigrationsExecutorImpl.prepareHashes)
            .then(MigrationsExecutorImpl.validateHashes)
            .then(this.executeMigrations)
            .catch(console.error);
    }

    private async initializeMigrationHistoryTable() {
        return this.DbClient.isTableExists(TableName.MigrationHistory)
            .then(isExists => {
                if (isExists) {
                    throw new MigrationHistoryTableAlreadyExistsError();
                }

                return this.DbClient.createTable(TableName.MigrationHistory, {
                    columns: {
                        id: { type: ColumnDataType.Number, primaryKey: true },
                        file_name: { type: ColumnDataType.String, required: true },
                        hash: { type: ColumnDataType.String, required: true },
                        success: { type: ColumnDataType.Boolean, required: true },
                    },
                    indexBy: [ "name", "hash" ],
                });
            })
    }

    private async prepareRecords() {
        return this.DbClient.findAll<MigrationHistoryRecord>(TableName.MigrationHistory);
    }

    private static async prepareFilenames(migrationsDirname: string, records: MigrationHistoryRecord[]) {
        return readdir(migrationsDirname).then(filenames => ({ records, filenames }));
    }

    private static prepareHashes(recordsAndFilenames: RecordsAndFilenames) {
        return {
            ...recordsAndFilenames,
            hashes: recordsAndFilenames.filenames
                .reduce((hashes, fn) => ({
                    ...hashes,
                    [ fn ]: createHash("md5")
                        .update(readFileSync(fn))
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

    private static executeMigration(filename: string) {
        return new Promise<void>(((resolve, reject) => {
            let invoked = false;
            const process = fork(filename);

            process.on("error", error => {
                if (invoked) return;
                invoked = true;
                reject(error);
            });

            process.on("exit", code => {
                if (invoked) return;
                invoked = true;

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Exit code: ${ code }`))
                }
            })
        }));
    }

    private async executeMigrations(recordsAndFilenamesAndHashes: RecordsAndFilenamesAndHashes) {
        const { records, filenames, hashes } = recordsAndFilenamesAndHashes;

        const sortedFilenames = filenames.sort((left, right) => left.localeCompare(right));

        for (const filename of sortedFilenames) {
            if (records.find(r => r.file_name === filename)) {
                return;
            }

            let failureReason: string;

            try {
                await MigrationsExecutorImpl.executeMigration(filename);
                console.log(`Migration ${ filename } successfully applied`);
            } catch (error) {
                if (error instanceof Error) {
                    failureReason = error.message;
                } else if (typeof error === "string") {
                    failureReason = error;
                } else {
                    failureReason = "Unknown reason";
                }
                console.log(`Migration ${ filename } executed with error: ${ failureReason }`);
            }

            await this.DbClient.save<MigrationHistoryRecord>(TableName.MigrationHistory, {
                file_name: filename,
                hash: hashes[ filename ],
                success: !failureReason,
                failure_reason: failureReason,
            });

        }
    };

}