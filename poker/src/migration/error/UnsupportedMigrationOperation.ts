import { MigrationOperation } from "../enum";

export default class UnsupportedMigrationOperation extends Error {

    constructor(operation: MigrationOperation) {
        super(`Migration operation ${ operation } isn't supported`);
        Object.setPrototypeOf(this, UnsupportedMigrationOperation.prototype);
    }

}