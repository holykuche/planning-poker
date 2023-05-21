namespace Protobuf {

    export type Entity<T extends object> = {
        [ K in keyof T ]: Value<T, K>
    };

    export type IntValue = { int_value: number };

    export type StringValue = { string_value: string };

    export type BoolValue = { bool_value: boolean };

    export type Value<T extends object, K extends keyof T> =
        T[ K ] extends number ? IntValue
        : T[ K ] extends string ? StringValue
        : T[ K ] extends boolean ? BoolValue
        : never

}

export default Protobuf;