import 'reflect-metadata';

import {container} from '@/config/inversify';
import {CORE_TYPES, Database} from '@/core/api';
import {ColumnDefinition, TableDefinition} from '@/core/dto';
import {ColumnDataType} from '@/core/enum';
import DatabaseImpl from '@/core/impl/DatabaseImpl';

type TestEntity = {
  id?: number;
  prop1: string;
  prop2: number;
  prop3: boolean;
};

const COLUMNS_WITH_PRIMARY_KEY: Record<string, ColumnDefinition> = {
  id: {type: ColumnDataType.Number, primary_key: true},
  prop1: {type: ColumnDataType.String, required: true},
  prop2: {type: ColumnDataType.Number, required: true},
  prop3: {type: ColumnDataType.Boolean, required: true},
};

const COLUMNS_WITHOUT_PRIMARY_KEY: Record<string, ColumnDefinition> = {
  id: {type: ColumnDataType.Number, required: true},
  prop1: {type: ColumnDataType.String, required: true},
  prop2: {type: ColumnDataType.Number, required: true},
  prop3: {type: ColumnDataType.Boolean, required: true},
};

describe('core/impl/DatabaseImpl', () => {
  let database: Database;

  beforeAll(() => {
    container.bind<Database>(CORE_TYPES.Database).to(DatabaseImpl);
    database = container.get(CORE_TYPES.Database);
  });

  function testTable(definition: TableDefinition<TestEntity>) {
    const tableName = 'TestTable';

    function testFindMany<K extends keyof TestEntity>(
      key: K,
      value: TestEntity[K],
      receivedCount: number,
      getExpected: (id: TestEntity['id']) => TestEntity
    ) {
      const receivedEntities = database.findMany(tableName, key, value);

      expect(receivedEntities.length).toBe(receivedCount);
      receivedEntities.forEach(receivedEntity => {
        expect(receivedEntity).toEqual(getExpected(receivedEntity.id));
      });
    }

    beforeEach(() => {
      database.createTable(tableName, definition);
    });

    afterEach(() => {
      database.dropTable(tableName);
    });

    it('save with existed object should update that object', () => {
      const id1 = 1;
      const id2 = 2;
      const props = {
        initial: {prop1: 'initial prop1', prop2: 500, prop3: false},
        updated: {prop1: 'updated prop1', prop2: 700, prop3: true},
      } as const;

      const entities: Record<
        string,
        {initial: TestEntity; updated: TestEntity}
      > = [id1, id2].reduce(
        (objs, id) => ({
          ...objs,
          [id]: {
            initial: {id, ...props.initial},
            updated: {id, ...props.updated},
          },
        }),
        {}
      );

      database.save(tableName, entities[id1].initial);
      database.save(tableName, entities[id1].updated);
      database.save(tableName, entities[id2].initial);
      database.save(tableName, entities[id2].updated);

      expect(database.find<TestEntity, 'id'>(tableName, 'id', id1)).toEqual(
        entities[id1].updated
      );
      expect(database.find<TestEntity, 'id'>(tableName, 'id', id2)).toEqual(
        entities[id2].updated
      );

      testFindMany('prop1', props.updated.prop1, 2, id => entities[id].updated);
      testFindMany('prop2', props.updated.prop2, 2, id => entities[id].updated);
      testFindMany('prop3', props.updated.prop3, 2, id => entities[id].updated);
      expect(
        database.findMany<TestEntity, 'prop1'>(
          tableName,
          'prop1',
          props.initial.prop1
        ).length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop2'>(
          tableName,
          'prop2',
          props.initial.prop2
        ).length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop3'>(
          tableName,
          'prop3',
          props.initial.prop3
        ).length
      ).toBe(0);
    });

    it('save with not existed object should create this object', () => {
      const entity: TestEntity = {
        id: 1,
        prop1: 'dummy prop1',
        prop2: 500,
        prop3: false,
      };

      expect(
        database.find<TestEntity, 'id'>(tableName, 'id', entity.id)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
      ).toBeNull();

      database.save(tableName, entity);
      expect(
        database.find<TestEntity, 'id'>(tableName, 'id', entity.id)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
      ).toEqual(entity);
    });

    it('delete should delete an object by primary key', () => {
      const entity: TestEntity = {
        id: 1,
        prop1: 'dummy prop1',
        prop2: 500,
        prop3: false,
      };

      database.save(tableName, entity);
      expect(
        database.find<TestEntity, 'id'>(tableName, 'id', entity.id)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
      ).toEqual(entity);
      expect(
        database.find<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
      ).toEqual(entity);

      database.delete<TestEntity, 'id'>(tableName, 'id', entity.id);
      expect(
        database.find<TestEntity, 'id'>(tableName, 'id', entity.id)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
      ).toBeNull();
      expect(
        database.find<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
      ).toBeNull();
    });

    it('delete should delete all objects by any not primary key', () => {
      const props: TestEntity = {
        prop1: 'dummy prop1',
        prop2: 500,
        prop3: false,
      };
      const entities: Record<number, TestEntity> = [1, 2, 3, 4, 5]
        .map(id => ({id, ...props}))
        .reduce(
          (entitiesById, entity) => ({
            ...entitiesById,
            [entity.id]: entity,
          }),
          {}
        );
      const otherProps: TestEntity = {
        prop1: 'other dummy prop1',
        prop2: 700,
        prop3: true,
      };
      const otherEntities: Record<number, TestEntity> = [6, 7, 8, 9]
        .map(id => ({id, ...otherProps}))
        .reduce(
          (entitiesById, entity) => ({
            ...entitiesById,
            [entity.id]: entity,
          }),
          {}
        );

      Object.values(otherEntities).forEach(e => database.save(tableName, e));
      testFindMany('prop1', otherProps.prop1, 4, id => otherEntities[id]);
      testFindMany('prop2', otherProps.prop2, 4, id => otherEntities[id]);
      testFindMany('prop3', otherProps.prop3, 4, id => otherEntities[id]);

      const testDelete = <K extends keyof TestEntity>(deleteByKey: K) => {
        Object.values(entities).forEach(e => database.save(tableName, e));

        testFindMany('prop1', props.prop1, 5, id => entities[id]);
        testFindMany('prop2', props.prop2, 5, id => entities[id]);
        testFindMany('prop3', props.prop3, 5, id => entities[id]);

        database.delete<TestEntity, K>(
          tableName,
          deleteByKey,
          props[deleteByKey]
        );

        expect(
          database.find<TestEntity, 'prop1'>(tableName, 'prop1', props.prop1)
        ).toBeNull();
        expect(
          database.find<TestEntity, 'prop2'>(tableName, 'prop2', props.prop2)
        ).toBeNull();
        expect(
          database.find<TestEntity, 'prop3'>(tableName, 'prop3', props.prop3)
        ).toBeNull();

        testFindMany('prop1', otherProps.prop1, 4, id => otherEntities[id]);
        testFindMany('prop2', otherProps.prop2, 4, id => otherEntities[id]);
        testFindMany('prop3', otherProps.prop3, 4, id => otherEntities[id]);
      };

      testDelete('prop1');
      testDelete('prop2');
      testDelete('prop3');
    });

    it('delete with not existed object should do nothing', () => {
      const entity: TestEntity = {
        id: 1,
        prop1: 'dummy prop1',
        prop2: 500,
        prop3: false,
      };

      expect(
        database.findMany<TestEntity, 'id'>(tableName, 'id', entity.id).length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
          .length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
          .length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
          .length
      ).toBe(0);

      expect(() =>
        database.delete<TestEntity, 'id'>(tableName, 'id', entity.id)
      ).not.toThrowError();
      expect(() =>
        database.delete<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
      ).not.toThrowError();
      expect(() =>
        database.delete<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
      ).not.toThrowError();
      expect(() =>
        database.delete<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
      ).not.toThrowError();

      expect(
        database.findMany<TestEntity, 'id'>(tableName, 'id', entity.id).length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop1'>(tableName, 'prop1', entity.prop1)
          .length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop2'>(tableName, 'prop2', entity.prop2)
          .length
      ).toBe(0);
      expect(
        database.findMany<TestEntity, 'prop3'>(tableName, 'prop3', entity.prop3)
          .length
      ).toBe(0);
    });
  }

  describe('with indexBy and primaryKey', () => {
    testTable({
      index_by: ['prop1', 'prop2', 'prop3'],
      columns: COLUMNS_WITH_PRIMARY_KEY,
    });
  });

  describe('with primaryKey', () => {
    testTable({
      columns: COLUMNS_WITH_PRIMARY_KEY,
    });
  });

  describe('without primaryKey', () => {
    const tableName = 'TestTable';

    beforeEach(() => {
      database.createTable(tableName, {
        columns: COLUMNS_WITHOUT_PRIMARY_KEY,
      });
    });

    afterEach(() => {
      database.dropTable(tableName);
    });

    it('save should store many objects with identical key values', () => {
      const entity1: TestEntity = {
        prop1: 'dummy prop1 1',
        prop2: 500,
        prop3: false,
      };
      const entity2: TestEntity = {
        prop1: 'dummy prop1 2',
        prop2: 700,
        prop3: true,
      };

      Array.from({length: 10})
        .map(() => ({...entity1}))
        .forEach(e => database.save(tableName, e));
      Array.from({length: 20})
        .map(() => ({...entity2}))
        .forEach(e => database.save(tableName, e));

      function testFindMany<K extends keyof TestEntity>(
        key: K,
        value: TestEntity[K],
        receivedCount: number,
        expected: TestEntity
      ) {
        const receivedEntities = database.findMany(tableName, key, value);

        expect(receivedEntities.length).toBe(receivedCount);
        receivedEntities.forEach(receivedEntity => {
          expect(receivedEntity).toEqual(expected);
        });
      }

      testFindMany('prop1', entity1.prop1, 10, entity1);
      testFindMany('prop2', entity1.prop2, 10, entity1);
      testFindMany('prop3', entity1.prop3, 10, entity1);

      testFindMany('prop1', entity2.prop1, 20, entity2);
      testFindMany('prop2', entity2.prop2, 20, entity2);
      testFindMany('prop3', entity2.prop3, 20, entity2);
    });
  });
});
