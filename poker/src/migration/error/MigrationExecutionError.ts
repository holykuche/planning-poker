export default class MigrationExecutionError extends Error {

    constructor(name: string, reason: string) {
        super(`Migration ${ name } executed with error: ${ reason }`);
        Object.setPrototypeOf(this, MigrationExecutionError.prototype);
    }


}