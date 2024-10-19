import {Protobuf} from '../dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isProtobufString = (value: any): value is Protobuf.StringValue => {
  return typeof value.string_value === 'string';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isProtobufNumber = (value: any): value is Protobuf.IntValue => {
  return typeof value.int_value === 'number';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isProtobufBoolean = (value: any): value is Protobuf.BoolValue => {
  return typeof value.bool_value === 'boolean';
};

export default class EntitySerializer {
  static serialize<T extends object>(entity?: T): Protobuf.Entity<T> {
    if (!entity) {
      return {} as Protobuf.Entity<T>;
    }

    return Object.entries(entity).reduce((pe, [key, value]) => {
      pe[key] = EntitySerializer.serializeValue(value as T[keyof T]);
      return pe;
    }, {} as Protobuf.Entity<T>);
  }

  static serializeValue<T extends object, K extends keyof T>(
    value: T[K]
  ): Protobuf.Value<T, K> {
    return (typeof value === 'string'
      ? {string_value: value}
      : typeof value === 'number'
        ? {int_value: value}
        : typeof value === 'boolean'
          ? {bool_value: value}
          : null) as unknown as Protobuf.Value<T, K>;
  }

  static deserialize<T extends object>(protobufEntity?: Protobuf.Entity<T>): T {
    if (!protobufEntity) {
      return null;
    }

    return Object.entries<Protobuf.Entity<T>[keyof Protobuf.Entity<T>]>(
      protobufEntity
    ).reduce((e, [key, value]) => {
      e[key] = EntitySerializer.deserializeValue<T, keyof T>(value);
      return e;
    }, {} as T);
  }

  static deserializeValue<T extends object, K extends keyof T>(
    protobufValue: Protobuf.Value<T, K>
  ): T[K] {
    return (
      isProtobufString(protobufValue)
        ? protobufValue.string_value
        : isProtobufNumber(protobufValue)
          ? protobufValue.int_value
          : isProtobufBoolean(protobufValue)
            ? protobufValue.bool_value
            : null
    ) as T[K];
  }
}
