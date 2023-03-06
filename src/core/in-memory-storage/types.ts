export type Key<E> = keyof E;
export type Value<E, K extends Key<E>> = E[ K ];
export type Entity = Record<string, any>;

export interface Options<E, PK> {
    indexBy?: Key<E>[];
    primaryKey?: Key<E>;
    initialPrimaryKeyValue?: PK;
    getNextPrimaryKeyValue?: (current: PK) => PK;
}
