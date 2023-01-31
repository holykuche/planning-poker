import "reflect-metadata";
import AbstractInMemoryDAOImpl from "data/in-memory-impl/AbstractInMemoryDAOImpl";

interface TestObject {
    id?: number,
    prop1: string,
    prop2: number,
    prop3: boolean,
}

describe("data/in-memory-impl/AbstractInMemoryDAOImpl" ,() => {

    describe("with indexBy option", () => {

        class IndexedDAOImpl extends AbstractInMemoryDAOImpl<TestObject, "id"> {
            constructor() {
                super({
                    indexBy: [ "prop1", "prop2", "prop3" ],
                    primaryKey: "id",
                });
            }
        }

        let indexedDAOImpl: IndexedDAOImpl;

        beforeEach(() => {
            indexedDAOImpl = new IndexedDAOImpl();
        });

        it("save with existed object should update that object", () => {
            const id1 = 1;
            const id2 = 2;
            const props = {
                initial: { prop1: "initial prop1", prop2: 500, prop3: false },
                updated: { prop1: "updated prop1", prop2: 700, prop3: true },
            } as const;

            const objects: Record<number, { initial: TestObject, updated: TestObject }>
                = [ id1, id2 ]
                .reduce((objs, id) => ({
                    ...objs,
                    [ id ]: {
                        initial: { id, ...props.initial },
                        updated: { id, ...props.updated },
                    },
                }), {});

            indexedDAOImpl.save(objects[ id1 ].initial);
            indexedDAOImpl.save(objects[ id1 ].updated);
            indexedDAOImpl.save(objects[ id2 ].initial);
            indexedDAOImpl.save(objects[ id2 ].updated);

            expect(indexedDAOImpl.find("id", id1)).toEqual(objects[ id1 ].updated);
            expect(indexedDAOImpl.find("id", id2)).toEqual(objects[ id2 ].updated);

            const testFindMany = <K extends keyof TestObject>(key: K, value: TestObject[ K ]) => {
                const receivedObjects = indexedDAOImpl.findMany(key, value);

                expect(receivedObjects.length).toBe(2);
                receivedObjects
                    .forEach(receivedObj => {
                        expect(receivedObj).toEqual(objects[ receivedObj.id ].updated)
                    });
            };

            testFindMany("prop1", props.updated.prop1);
            testFindMany("prop2", props.updated.prop2);
            testFindMany("prop3", props.updated.prop3);
            expect(indexedDAOImpl.findMany("prop1", props.initial.prop1).length).toBe(0);
            expect(indexedDAOImpl.findMany("prop2", props.initial.prop2).length).toBe(0);
            expect(indexedDAOImpl.findMany("prop3", props.initial.prop3).length).toBe(0);
        });

        it("delete should delete an object", () => {
            const obj: TestObject = { id: 1, prop1: "initial prop1", prop2: 500, prop3: false };

            indexedDAOImpl.save(obj);
            expect(indexedDAOImpl.find("id", obj.id)).toEqual(obj);

            indexedDAOImpl.delete("id", obj.id);
            expect(indexedDAOImpl.find("id", obj.id)).toBeNull();
            expect(indexedDAOImpl.find("prop1", obj.prop1)).toBeNull();
            expect(indexedDAOImpl.find("prop2", obj.prop2)).toBeNull();
            expect(indexedDAOImpl.find("prop3", obj.prop3)).toBeNull();
        });

    });
});