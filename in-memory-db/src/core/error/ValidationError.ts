import { Entity } from "../dto";

export default class ValidationError extends Error {

    constructor(tableName: string, entity: Entity, cause: string) {
        super(`Error during save entity in table ${tableName}: ${cause}\nEntity: ${JSON.stringify(entity)}`);
    }

}