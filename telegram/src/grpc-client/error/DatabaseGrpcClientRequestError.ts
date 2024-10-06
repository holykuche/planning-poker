import GrpcClientRequestError from './GrpcClientRequestError';
import GrpcClientRequestErrorType from './GrpcClientRequestErrorType';

export default class DatabaseGrpcClientRequestError extends GrpcClientRequestError {
  constructor(methodName: string, request: object, message?: string) {
    super(GrpcClientRequestErrorType.Database, methodName, request, message);

    Object.setPrototypeOf(this, DatabaseGrpcClientRequestError.prototype);
  }
}
