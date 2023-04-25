import { Entity } from "../dto";

export default interface Table<E extends Entity> {

    find<K extends keyof E>(key: K, value: E[ K ]): E;

    findMany<K extends keyof E>(key: K, value: E[ K ]): E[];

    save(entity: E): E;

    delete<K extends keyof E>(key: K, value: E[ K ]): void;

}
