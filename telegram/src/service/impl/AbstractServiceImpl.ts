import {ServerErrorResponse} from '@grpc/grpc-js';
import {Status} from '@grpc/grpc-js/build/src/constants';
import {injectable} from 'inversify';

@injectable()
export default abstract class AbstractServiceImpl {
  protected static handleGrpcError(error: ServerErrorResponse) {
    if (error.code === Status.NOT_FOUND) {
      return null;
    }

    throw error;
  }
}
