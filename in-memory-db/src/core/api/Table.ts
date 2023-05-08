import { Entity } from "../dto";

export default interface Table {

    find(key: string, value: string): Entity;

    findMany(key: string, value: string): Entity[];

    findAll(): Entity[];

    save(entity: Entity): Entity;

    delete(key: string, value: string): void;

}
