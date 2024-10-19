import Protobuf from './Protobuf';

export default interface TableFieldRequest<
  T extends object,
  K extends keyof T,
> {
  table_name: string;
  key: K;
  value: Protobuf.Value<T, K>;
}
