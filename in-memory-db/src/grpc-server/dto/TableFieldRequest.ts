export default interface TableFieldRequest<T, K extends keyof T> {
  table_name: string;
  key: K;
  value: T[K];
}
