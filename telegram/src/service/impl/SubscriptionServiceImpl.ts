import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, SubscriptionClient} from '@/grpc-client/api';
import {LobbyEvent} from '@/grpc-client/event';

import {SubscriptionService} from '../api';

import AbstractServiceImpl from './AbstractServiceImpl';

@injectable()
export default class SubscriptionServiceImpl
  extends AbstractServiceImpl
  implements SubscriptionService
{
  @inject(GRPC_CLIENT_TYPES.SubscriptionClient)
  private readonly subscriptionClient: SubscriptionClient;

  subscribe(
    lobbyId: number,
    memberId: number,
    next: (event: LobbyEvent) => void
  ): Promise<void> {
    return this.subscriptionClient
      .subscribe(
        lobbyId,
        memberId,
        next,
        SubscriptionServiceImpl.handleGrpcError
      )
      .catch(SubscriptionServiceImpl.handleGrpcError);
  }
}
