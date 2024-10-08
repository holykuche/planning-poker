import {ServerErrorResponse} from '@grpc/grpc-js';
import {Status} from '@grpc/grpc-js/build/src/constants';
import {injectable} from 'inversify';

import {ServiceError, ServiceErrorType} from '@/service/error';

@injectable()
export default abstract class AbstractGrpcServiceImpl {
  protected static fromServiceErrorToGrpcError(
    serviceError: ServiceError
  ): ServerErrorResponse {
    const grpcBaseError: ServerErrorResponse = {
      name: serviceError.name,
      message: serviceError.message,
      stack: serviceError.stack,
      cause: serviceError.cause,
    };

    switch (serviceError.errorType) {
      case ServiceErrorType.LobbyAlreadyExists:
        return {...grpcBaseError, code: Status.ALREADY_EXISTS};
      case ServiceErrorType.UnknownMember:
      case ServiceErrorType.UnknownLobby:
        return {...grpcBaseError, code: Status.NOT_FOUND};
      case ServiceErrorType.MemberIsAlreadyInLobby:
      case ServiceErrorType.PokerIsAlreadyStarted:
      case ServiceErrorType.MemberIsNotInLobby:
      case ServiceErrorType.PokerIsNotStarted:
        return {...grpcBaseError, code: Status.FAILED_PRECONDITION};
      default:
        return {...grpcBaseError, code: Status.UNKNOWN};
    }
  }
}
