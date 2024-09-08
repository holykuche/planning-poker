import Protobuf from './Protobuf';

export default interface EntityResponse<T extends object> {
  result: Protobuf.Entity<T>;
}
