import { ColumnDefinition, Entity, TableDefinition } from "../dto";
import { ColumnDataType } from "../enum";
import { ValidationError, TableInitializeError } from "../error";
import { Table } from "../api";

type IndexMaps = Record<string, Map<string, number[]>>;

export default class TableImpl implements Table {

    private static readonly DEFAULT_DEFINITION: Partial<TableDefinition> = {
        indexBy: [],
    };

    private readonly tableName: string;
    private readonly data: Entity[];
    private currentFreeIndex: number;
    private readonly freeIndexes: Map<number/*current*/, number/*previous*/>;
    private readonly indexMaps: IndexMaps;
    private readonly primaryKey?: string;
    private nextPrimaryKeyValue?: number;
    private readonly columnDefinitions: Record<string, ColumnDefinition>;

    constructor(tableName: string, definition: TableDefinition) {
        const { indexBy, columns } = { ...TableImpl.DEFAULT_DEFINITION, ...definition };

        const primaryKeys = Object.entries(columns)
            .filter(([ , def ]) => def.primaryKey);

        switch (primaryKeys.length) {
            case 0:
                this.primaryKey = null;
                this.nextPrimaryKeyValue = null;
                break;
            case 1:
                const [ columnName, columnDefinition ] = primaryKeys[ 0 ];

                if (columnDefinition.type !== ColumnDataType.Number) {
                    throw new TableInitializeError(
                        tableName,
                        `Primary key with type "${ columnDefinition.type }" isn't supported.`
                        + ` It should be "${ ColumnDataType.Number }".`,
                    );
                }

                this.primaryKey = columnName;
                this.nextPrimaryKeyValue = 0;

                break;
            default:
                throw new TableInitializeError(
                    tableName,
                    `It's found more than 1 primary keys: ${ primaryKeys.map(([ key ]) => key).join(", ") }.`,
                );
        }

        this.tableName = tableName;
        this.columnDefinitions = columns;

        this.data = [];

        this.currentFreeIndex = null;
        this.freeIndexes = new Map<number, number>();

        this.indexMaps = (this.primaryKey ? [ this.primaryKey, ...indexBy ] : indexBy)
            .filter(TableImpl.distinct)
            .reduce((idxMaps, key) => ({
                ...idxMaps,
                [ key ]: new Map<string, number[]>(),
            }), {} as IndexMaps);
    }

    find(key: string, value: string): Entity {
        if (this.indexMaps[ key ]) {
            const firstIdx = this.indexMaps[ key ].get(value)?.[ 0 ];
            return this.data[ firstIdx ] ? { ...this.data[ firstIdx ] } : null;
        }

        const entity = this.data
            .find((e, idx) => !this.isIndexFree(idx) && e[ key ] === value);
        return entity ? { ...entity } : null;
    }

    findMany(key: string, value: string): Entity[] {
        if (this.indexMaps[ key ]) {
            return this.indexMaps[ key ].get(value)
                    ?.map(idx => ({ ...this.data[ idx ] }))
                || [];
        }

        return this.data
            .filter((e, idx) => !this.isIndexFree(idx) && e[ key ] === value)
            .map(e => ({ ...e }));
    }

    findAll(): Entity[] {
        return this.data
            .filter((e, idx) => !this.freeIndexes.has(idx));
    }

    save(entity: Entity): Entity {
        this.validate(entity);

        let idx: number;
        let storedEntity: Entity;

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

        Object.entries<Map<string, number[]>>(this.indexMaps)
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
                    .filter(TableImpl.distinct);

                indexMap.set(storedEntity[ key ], storedIdxes);
            });

        return { ...storedEntity };
    }

    delete(key: string, value: string): void {
        let indexes: number[];

        if (this.indexMaps[ key ]) {
            indexes = this.indexMaps[ key ].get(value) || [];
        } else {
            indexes = this.data
                .reduce((idxes, e, idx) => {
                    if (this.isIndexFree(idx) || e[ key ] !== value) {
                        return idxes;
                    }

                    return idxes.concat([ idx ]);
                }, [] as number[]);
        }

        indexes
            .map(idx => [ idx, this.data[ idx ] ] as [ number, Entity ])
            .forEach(([ idx, entity ]) => {
                Object.entries<Map<string, number[]>>(this.indexMaps)
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

        this.addFreeIndex(...indexes);
    }

    private getFreeIndex(): number {
        const freeIndex = this.currentFreeIndex;
        this.currentFreeIndex = this.freeIndexes.get(freeIndex);
        this.freeIndexes.delete(freeIndex);

        return typeof freeIndex === "number" ? freeIndex : this.data.length;
    }

    private addFreeIndex(...indexes: number[]): void {
        indexes
            .forEach(idx => {
                this.freeIndexes.set(idx, this.currentFreeIndex);
                this.currentFreeIndex = idx;
            });
    }

    private isIndexFree(index: number): boolean {
        return this.freeIndexes.has(index);
    }

    private getAvailablePrimaryKeyValue(): string {
        const availablePrimaryKeyValue = this.nextPrimaryKeyValue;
        this.nextPrimaryKeyValue++;

        return String(availablePrimaryKeyValue);
    }

    private validate(entity: Entity): void {
        const entityFields = Object.entries(entity);

        const requiredNullFields = entityFields
            .filter(([ key ]) => this.columnDefinitions[ key ].required && this.primaryKey !== key)
            .filter(([ , value ]) => value === null || value === undefined);

        if (requiredNullFields.length) {
            throw new ValidationError(
                this.tableName,
                entity,
                `Unexpected required null fields: ${ requiredNullFields.map(([ key ]) => key).join(", ") }.`,
            );
        }

        const incompatibleTypeFields = entityFields
            .filter(([ key, value ]) => !TableImpl.isFieldTypeValid(this.columnDefinitions[ key ].type, value));

        if (incompatibleTypeFields.length) {
            const incompatibleTypeFieldsStr = incompatibleTypeFields
                .map(([ key, value ]) => `${ key }=${ value } (must be ${ this.columnDefinitions[ key ].type })`)
                .join(", ");

            throw new ValidationError(
                this.tableName,
                entity,
                `Incompatible field's type(s): ${ incompatibleTypeFieldsStr }`,
            );
        }
    }

    private static isFieldTypeValid(type: ColumnDataType, value: string): boolean {
        switch (type) {
            case ColumnDataType.Number:
                return /^-?\d+(\.\d*)?$/.test(value);
            case ColumnDataType.Boolean:
                return /^true|false$/.test(value);
            default:
                return true;
        }
    }

    private static distinct<T>(f: T, i: number, self: T[]): boolean {
        return self.indexOf(f) === i;
    }
}