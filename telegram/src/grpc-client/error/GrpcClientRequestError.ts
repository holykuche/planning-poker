import GrpcClientRequestErrorType from './GrpcClientRequestErrorType';

export default abstract class GrpcClientRequestError extends Error {
  readonly errorType: GrpcClientRequestErrorType;

  readonly methodName: string;
  readonly request: object;

  protected constructor(
    errorType: GrpcClientRequestErrorType,
    methodName: string,
    request: object,
    message?: string
  ) {
    super(message);

    this.errorType = errorType;
    this.methodName = methodName;
    this.request = request;
  }

  toString() {
    return `[${this.errorType} GRPC CLIENT REQUEST ERROR] ${this.methodName}(${JSON.stringify(this.request, null, 2)}): ${this.message}`;
  }
}
