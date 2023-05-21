import Protobuf from "./Protobuf";

export default interface EntityRequest<T extends object> {
    table_name: string;
    entity: Protobuf.Entity<T>;
}