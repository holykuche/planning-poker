import {
  loadPackageDefinition,
  ServiceClientConstructor,
  credentials,
} from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';
import {injectable, unmanaged} from 'inversify';

import {PokerGrpcClientRequestError} from '../error';

@injectable()
export default abstract class AbstractPokerClientImpl {
  private readonly stub: InstanceType<ServiceClientConstructor>;

  constructor(@unmanaged() serviceName: string) {
    const PROTO_PATH = __dirname + '/poker.proto';

    const packageDefinition = loadSync(PROTO_PATH, {
      enums: String,
      keepCase: true,
    });
    const protoDescriptor = loadPackageDefinition(packageDefinition);

    const ClientConstructor = protoDescriptor[
      serviceName
    ] as ServiceClientConstructor;
    this.stub = new ClientConstructor(
      `${process.env.POKER_IP}:${process.env.POKER_PORT}`,
      credentials.createInsecure()
    );
  }

  protected promiseFactory<T>(methodName: string, request: object): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.stub[methodName](
        request,
        AbstractPokerClientImpl.callbackFactory<T>(resolve, reject)
      );
    }).catch(e => {
      if (e instanceof Error) {
        throw new PokerGrpcClientRequestError(methodName, request, e.message);
      } else {
        throw e;
      }
    });
  }

  private static callbackFactory<T>(
    resolve: (value: T) => void,
    reject: (error: Error) => void
  ): (error: Error, value: T) => void {
    return (error, value) => (error ? reject(error) : resolve(value));
  }
}
