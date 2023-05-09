export default class ValidationError<T extends object> extends Error {

    constructor(tableName: string, entity: T, cause: string) {
        super(`Error during save entity in table ${ tableName }: ${ cause }\nEntity: ${ JSON.stringify(entity, null, 2) }`);
    }

}