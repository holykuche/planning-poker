import ServiceErrorType from './ServiceErrorType';

export default abstract class ServiceError extends Error {
  readonly errorType: ServiceErrorType;

  protected constructor(errorType: ServiceErrorType, message?: string) {
    super(message);
    this.errorType = errorType;
  }
}
