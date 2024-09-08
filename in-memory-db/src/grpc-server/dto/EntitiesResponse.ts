import EntityResponse from './EntityResponse';

export default interface EntitiesResponse<T extends object> {
  result: EntityResponse<T>[];
}
