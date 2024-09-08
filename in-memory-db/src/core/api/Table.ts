export default interface Table<T extends object> {
  find<K extends keyof T>(key: K, value: T[K]): T;

  findMany<K extends keyof T>(key: K, value: T[K]): T[];

  findAll(): T[];

  save(entity: T): T;

  delete<K extends keyof T>(key: K, value: T[K]): void;
}
