import { injectable } from "inversify";
import { InMemoryStorage, Key, Value, Entity, Options } from "core/in-memory-storage";

@injectable()
export default abstract class AbstractInMemoryDAOImpl<E extends Entity, PK extends Key<E> = never> {

    private readonly storage: InMemoryStorage<E, PK>;

    constructor(options: Options<E, Value<E, PK>> = {}) {
        this.storage = new InMemoryStorage(options);
    }

    find<K extends Key<E>>(key: K, value: Value<E, K>): E {
        return this.storage.find(key, value);
    }

    findMany<K extends Key<E>>(key: K, value: Value<E, K>): E[] {
        return this.storage.findMany(key, value);
    }

    save(entity: E): E {
        return this.storage.save(entity);
    }

    delete<K extends Key<E>>(key: K, value: Value<E, K>): void {
        return this.storage.delete(key, value);
    }

}