import { injectable } from "inversify";

type Key<E> = keyof E;
type Value<E, K extends Key<E>> = E[ K ];
type Entity = Record<string, any>;

interface Options<E, PK> {
    indexBy?: Key<E>[];
    primaryKey?: Key<E>;
    initialPrimaryKeyValue?: PK;
    getNextPrimaryKeyValue?: (current: PK) => PK;
}

type IndexMaps<E> = { [ F in Key<E> ]: Map<Value<E, F>, number[]> };

@injectable()
export default abstract class AbstractInMemoryDAOImpl<E extends Entity, PK extends Key<E> = never> {

    private static readonly DEFAULT_OPTIONS: Options<undefined, never> = {
        indexBy: [],
    };

    private readonly data: E[];
    private readonly freeIndexes: number[];
    private readonly indexMaps: IndexMaps<E>;
    private readonly primaryKey: Key<E>;
    private readonly getNextPrimaryKeyValue: (current: Value<E, PK>) => Value<E, PK>;
    private primaryKeyValue: Value<E, PK>;

    constructor(options: Options<E, Value<E, PK>> = {}) {
        const { indexBy, primaryKey, initialPrimaryKeyValue, getNextPrimaryKeyValue } = { ...AbstractInMemoryDAOImpl.DEFAULT_OPTIONS, ...options };

        this.data = [];
        this.freeIndexes = [];
        this.primaryKey = primaryKey;
        this.primaryKeyValue = initialPrimaryKeyValue;
        this.getNextPrimaryKeyValue = getNextPrimaryKeyValue;

        this.indexMaps = (primaryKey ? [ primaryKey, ...indexBy ] : indexBy)
            .filter(AbstractInMemoryDAOImpl.distinct)
            .reduce((idxMaps, key) => ({
                ...idxMaps,
                [ key ]: new Map<Value<E, typeof key>, number[]>(),
            }), {} as IndexMaps<E>);
    }

    find<K extends Key<E>>(key: K, value: Value<E, K>): E {
        if (this.indexMaps[ key ]) {
            const firstIdx = this.indexMaps[ key ].get(value)?.[ 0 ];
            return this.data[ firstIdx ] ? { ...this.data[ firstIdx ] } : null;
        }

        const entity = this.data
            .find((e, idx) => !this.freeIndexes.includes(idx) && e[ key ] === value);
        return entity ? { ...entity } : null;
    }

    findMany<K extends Key<E>>(key: K, value: Value<E, K>): E[] {
        if (this.indexMaps[ key ]) {
            return this.indexMaps[ key ].get(value)
                ?.map(idx => ({ ...this.data[idx] }))
                || [];
        }

        return this.data
            .filter((e, idx) => !this.freeIndexes.includes(idx) && e[ key ] === value)
            .map(e => ({ ...e }));
    }

    save(entity: E): E {
        let idx: number;
        let storedEntity: E;

        if (this.primaryKey) {
            if (entity[ this.primaryKey ]) {
                idx = this.indexMaps[ this.primaryKey ].get(entity[ this.primaryKey ])?.[ 0 ];
                if (typeof idx !== "number") {
                    idx = this.getFreeIndex();
                }
                storedEntity = { ...entity };
            } else {
                idx = this.getFreeIndex();
                storedEntity = { [ this.primaryKey ]: this.getAvailablePrimaryKeyValue(), ...entity };
            }
        } else {
            idx = this.getFreeIndex();
            storedEntity = { ...entity };
        }

        const existedEntity = this.data[ idx ];
        this.data[ idx ] = storedEntity;

        Object.entries<IndexMaps<E>[ Key<E> ]>(this.indexMaps)
            .forEach(([ key, indexMap ]) => {
                if (existedEntity) {
                    const indexes = indexMap.get(existedEntity[ key ]) || [];
                    const storedIdxes = indexes
                        .filter(i => i !== idx);

                    if (storedIdxes.length) {
                        indexMap.set(existedEntity[ key ], storedIdxes);
                    } else {
                        indexMap.delete(existedEntity[ key ]);
                    }
                }

                const indexes = indexMap.get(storedEntity[ key ]) || [];
                const storedIdxes = [ ...indexes, idx ]
                    .filter(AbstractInMemoryDAOImpl.distinct);

                indexMap.set(storedEntity[ key ], storedIdxes);
            });

        return { ...storedEntity };
    }

    delete<K extends Key<E>>(key: K, value: Value<E, K>): void {
        let indexes: number[];

        if (this.indexMaps[ key ]) {
            indexes = this.indexMaps[ key ].get(value) || [];
        } else {
            indexes = this.data
                .reduce((idxes, e, idx) => {
                    if (this.freeIndexes.includes(idx) || e[ key ] !== value) {
                        return idxes;
                    }

                    return idxes.concat([ idx ]);
                }, [] as number[]);
        }

        indexes
            .map(idx => [ idx, this.data[ idx ] ] as [ number, E ])
            .forEach(([ idx, entity]) => {
                Object.entries<IndexMaps<E>[ keyof E ]>(this.indexMaps)
                    .forEach(([ f, indexMap ]) => {
                        const indexes = indexMap.get(entity[ f ]);
                        const storedIndexes = indexes
                            .filter(i => i !== idx);

                        if (storedIndexes.length) {
                            indexMap.set(entity[ f ], storedIndexes);
                        } else {
                            indexMap.delete(entity[ f ]);
                        }
                    });
            });

        this.freeIndexes.push(...indexes);
    }

    private getFreeIndex(): number {
        const freeIndex = this.freeIndexes.pop();
        return typeof freeIndex === "number" ? freeIndex : this.data.length;
    }

    private getAvailablePrimaryKeyValue(): Value<E, PK> {
        if (!this.primaryKeyValue || !this.getNextPrimaryKeyValue) {
            throw new Error(`Can't calculate primary key '${String(this.primaryKey)}' automatically.`);
        }

        const availablePrimaryKeyValue = this.primaryKeyValue;
        this.primaryKeyValue = this.getNextPrimaryKeyValue(this.primaryKeyValue);

        return availablePrimaryKeyValue;
    }

    private static distinct<T>(f: T, i: number, self: T[]): boolean {
        return self.indexOf(f) === i;
    }
}