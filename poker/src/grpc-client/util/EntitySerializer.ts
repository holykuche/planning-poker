import { Protobuf } from "../dto";

const isProtobufString = (value: any): value is Protobuf.StringValue => {
    return typeof value.string_value === "string";
};

const isProtobufNumber = (value: any): value is Protobuf.IntValue => {
    return typeof value.int_value === "number";
};

const isProtobufBoolean = (value: any): value is Protobuf.BoolValue => {
    return typeof value.bool_value === "boolean";
};

export default {

    serialize: <T extends object>(entity: T): Protobuf.Entity<T> => {
        return Object.entries(entity)
            .reduce((pe, [ key, value ]) => ({
                ...pe,
                [ key ]:
                    typeof value === "string" ? { string_value: value }
                    : typeof value === "number" ? { int_value: value }
                    : typeof value === "boolean" ? { bool_value: value }
                    : null,
            }), {} as Protobuf.Entity<T>);
    },

    deserialize: <T extends object>(protobufEntity: Protobuf.Entity<T>): T => {
        return Object.entries<Protobuf.Entity<T>[ keyof Protobuf.Entity<T> ]>(protobufEntity)
            .reduce((e, [ key, value ]) => ({
                ...e,
                [ key ]:
                    isProtobufString(value) ? value.string_value
                    : isProtobufNumber(value) ? value.int_value
                    : isProtobufBoolean(value) ? value.bool_value
                    : null,
            }), {} as T);
    },

};