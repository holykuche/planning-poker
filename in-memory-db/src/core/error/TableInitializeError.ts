export default class TableInitializeError extends Error {

    constructor(tableName: string, cause: string) {
        super(`Error during initialize ${ tableName } table: ${ cause }`);
    }

}