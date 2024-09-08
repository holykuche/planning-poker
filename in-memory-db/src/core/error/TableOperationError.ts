export default class TableOperationError extends Error {
  constructor(tableName: string, cause: string) {
    super(
      `Error during find/save/delete operation in table ${tableName}: ${cause}`
    );
  }
}
