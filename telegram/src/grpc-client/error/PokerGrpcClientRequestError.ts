import GrpcClientRequestError from './GrpcClientRequestError';
import GrpcClientRequestErrorType from './GrpcClientRequestErrorType';

export default class PokerGrpcClientRequestError extends GrpcClientRequestError {
  constructor(methodName: string, request: object, message?: string) {
    super(GrpcClientRequestErrorType.Poker, methodName, request, message);

    Object.setPrototypeOf(this, PokerGrpcClientRequestError.prototype);
  }
}
