import "reflect-metadata";
import AbstractInMemoryDAOImpl from "data/in-memory-impl/AbstractInMemoryDAOImpl";

interface TestEntity {
    id?: number,
    prop1: string,
    prop2: number,
    prop3: boolean,
}

interface AbstractInMemoryDAOImplConstructor {
    new(): AbstractInMemoryDAOImpl<TestEntity>;
}

describe("data/in-memory-impl/AbstractInMemoryDAOImpl" ,() => {

    const testImpl = function(Constructor: AbstractInMemoryDAOImplConstructor) {

        let impl: AbstractInMemoryDAOImpl<TestEntity>;

        const testFindMany = <K extends keyof TestEntity>(key: K,
                                                          value: TestEntity[ K ],
                                                          receivedCount: number,
                                                          getExpected: (id: number) => TestEntity) => {
            const receivedEntities = impl.findMany(key, value);

            expect(receivedEntities.length).toBe(receivedCount);
            receivedEntities
                .forEach(receivedEntity => {
                    expect(receivedEntity).toEqual(getExpected(receivedEntity.id));
                });
        };

        beforeEach(() => {
            impl = new Constructor();
        });

        it("save with existed object should update that object", () => {
            const id1 = 1;
            const id2 = 2;
            const props = {
                initial: { prop1: "initial prop1", prop2: 500, prop3: false },
                updated: { prop1: "updated prop1", prop2: 700, prop3: true },
            } as const;

            const entities: Record<number, { initial: TestEntity, updated: TestEntity }>
                = [ id1, id2 ]
                .reduce((objs, id) => ({
                    ...objs,
                    [ id ]: {
                        initial: { id, ...props.initial },
                        updated: { id, ...props.updated },
                    },
                }), {});

            impl.save(entities[ id1 ].initial);
            impl.save(entities[ id1 ].updated);
            impl.save(entities[ id2 ].initial);
            impl.save(entities[ id2 ].updated);

            expect(impl.find("id", id1)).toEqual(entities[ id1 ].updated);
            expect(impl.find("id", id2)).toEqual(entities[ id2 ].updated);

            testFindMany("prop1", props.updated.prop1, 2, id => entities[ id ].updated);
            testFindMany("prop2", props.updated.prop2, 2, id => entities[ id ].updated);
            testFindMany("prop3", props.updated.prop3, 2, id => entities[ id ].updated);
            expect(impl.findMany("prop1", props.initial.prop1).length).toBe(0);
            expect(impl.findMany("prop2", props.initial.prop2).length).toBe(0);
            expect(impl.findMany("prop3", props.initial.prop3).length).toBe(0);
        });

        it("save with not existed object should create this object", () => {
            const entity: TestEntity = { id: 1, prop1: "dummy prop1", prop2: 500, prop3: false };

            expect(impl.find("id", entity.id)).toBeNull();
            expect(impl.find("prop1", entity.prop1)).toBeNull();
            expect(impl.find("prop2", entity.prop2)).toBeNull();
            expect(impl.find("prop3", entity.prop3)).toBeNull();

            impl.save(entity);
            expect(impl.find("id", entity.id)).toEqual(entity);
            expect(impl.find("prop1", entity.prop1)).toEqual(entity);
            expect(impl.find("prop2", entity.prop2)).toEqual(entity);
            expect(impl.find("prop3", entity.prop3)).toEqual(entity);
        });

        it("delete should delete an object by primary key", () => {
            const entity: TestEntity = { id: 1, prop1: "dummy prop1", prop2: 500, prop3: false };

            impl.save(entity);
            expect(impl.find("id", entity.id)).toEqual(entity);
            expect(impl.find("prop1", entity.prop1)).toEqual(entity);
            expect(impl.find("prop2", entity.prop2)).toEqual(entity);
            expect(impl.find("prop3", entity.prop3)).toEqual(entity);

            impl.delete("id", entity.id);
            expect(impl.find("id", entity.id)).toBeNull();
            expect(impl.find("prop1", entity.prop1)).toBeNull();
            expect(impl.find("prop2", entity.prop2)).toBeNull();
            expect(impl.find("prop3", entity.prop3)).toBeNull();
        });

        it("delete should delete all objects by any not primary key", () => {
            const props: TestEntity = { prop1: "dummy prop1", prop2: 500, prop3: false };
            const entities: Record<number, TestEntity> = [ 1, 2, 3, 4, 5 ]
                .map(id => ({ id, ...props }))
                .reduce((entitiesById, entity) => ({
                    ...entitiesById,
                    [ entity.id ]: entity,
                }), {});
            const otherProps: TestEntity = { prop1: "other dummy prop1", prop2: 700, prop3: true };
            const otherEntities: Record<number, TestEntity> = [ 6, 7, 8, 9 ]
                .map(id => ({ id, ...otherProps }))
                .reduce((entitiesById, entity) => ({
                    ...entitiesById,
                    [ entity.id ]: entity,
                }), {});

            Object.values(otherEntities).forEach(e => impl.save(e));
            testFindMany("prop1", otherProps.prop1, 4, id => otherEntities[ id ]);
            testFindMany("prop2", otherProps.prop2, 4, id => otherEntities[ id ]);
            testFindMany("prop3", otherProps.prop3, 4, id => otherEntities[ id ]);

            const testDelete = (deleteByKey: keyof TestEntity) => {
                Object.values(entities).forEach(e => impl.save(e));

                testFindMany("prop1", props.prop1, 5, id => entities[ id ]);
                testFindMany("prop2", props.prop2, 5, id => entities[ id ]);
                testFindMany("prop3", props.prop3, 5, id => entities[ id ]);

                impl.delete(deleteByKey, props[ deleteByKey ]);

                expect(impl.find("prop1", props.prop1)).toBeNull();
                expect(impl.find("prop2", props.prop2)).toBeNull();
                expect(impl.find("prop3", props.prop3)).toBeNull();

                testFindMany("prop1", otherProps.prop1, 4, id => otherEntities[ id ]);
                testFindMany("prop2", otherProps.prop2, 4, id => otherEntities[ id ]);
                testFindMany("prop3", otherProps.prop3, 4, id => otherEntities[ id ]);
            };

            testDelete("prop1");
            testDelete("prop2");
            testDelete("prop3");
        });

        it("delete with not existed object should do nothing", () => {
            const entity: TestEntity = { id: 1, prop1: "dummy prop1", prop2: 500, prop3: false };

            expect(impl.findMany("id" ,entity.id).length).toBe(0);
            expect(impl.findMany("prop1" ,entity.prop1).length).toBe(0);
            expect(impl.findMany("prop2" ,entity.prop2).length).toBe(0);
            expect(impl.findMany("prop3" ,entity.prop3).length).toBe(0);

            expect(() => impl.delete("id", entity.id)).not.toThrowError();
            expect(() => impl.delete("prop1", entity.prop1)).not.toThrowError();
            expect(() => impl.delete("prop2", entity.prop2)).not.toThrowError();
            expect(() => impl.delete("prop3", entity.prop3)).not.toThrowError();

            expect(impl.findMany("id" ,entity.id).length).toBe(0);
            expect(impl.findMany("prop1" ,entity.prop1).length).toBe(0);
            expect(impl.findMany("prop2" ,entity.prop2).length).toBe(0);
            expect(impl.findMany("prop3" ,entity.prop3).length).toBe(0);
        });

        it("save without possibility to get primary key should throw error", () => {
            const entity: TestEntity = { prop1: "dummy prop1", prop2: 500, prop3: false };

            expect(() => impl.save(entity)).toThrowError("Can't calculate primary key 'id' automatically.");
        });
    };

    describe("with indexBy and primaryKey options", () => {

        class IndexedDAOImpl extends AbstractInMemoryDAOImpl<TestEntity> {
            constructor() {
                super({
                    indexBy: [ "prop1", "prop2", "prop3" ],
                    primaryKey: "id",
                });
            }
        }

        testImpl(IndexedDAOImpl);
    });

    describe("with primaryKey option", () => {

        class NotIndexedDAOImpl extends AbstractInMemoryDAOImpl<TestEntity> {
            constructor() {
                super({
                    primaryKey: "id",
                });
            }
        }

        testImpl(NotIndexedDAOImpl);
    });

    describe("without any options", () => {

        class WithoutOptionsDAOImpl extends AbstractInMemoryDAOImpl<TestEntity> {}

        let impl: WithoutOptionsDAOImpl;

        beforeEach(() => {
            impl = new WithoutOptionsDAOImpl();
        });

        it("save should store many objects with identical key values", () => {
            const entity1 = { prop1: "dummy prop1 1", prop2: 500, prop3: false };
            const entity2 = { prop1: "dummy prop1 2", prop2: 700, prop3: true };

            Array.from({ length: 10 })
                .map(() => ({ ...entity1 }))
                .forEach(e => impl.save(e));
            Array.from({ length: 20 })
                .map(() => ({ ...entity2 }))
                .forEach(e => impl.save(e));

            const testFindMany = <K extends keyof TestEntity>(key: K,
                                                              value: TestEntity[ K ],
                                                              receivedCount: number,
                                                              expected: TestEntity) => {
                const receivedEntities = impl.findMany(key, value);

                expect(receivedEntities.length).toBe(receivedCount);
                receivedEntities
                    .forEach(receivedEntity => {
                        expect(receivedEntity).toEqual(expected);
                    });
            };

            testFindMany("prop1", entity1.prop1, 10, entity1);
            testFindMany("prop2", entity1.prop2, 10, entity1);
            testFindMany("prop3", entity1.prop3, 10, entity1);

            testFindMany("prop1", entity2.prop1, 20, entity2);
            testFindMany("prop2", entity2.prop2, 20, entity2);
            testFindMany("prop3", entity2.prop3, 20, entity2);
        });

    });
});