import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, SubscriptionClient} from '@/grpc-client/api';
import {LobbyEvent} from '@/grpc-client/event';

import {SubscriptionService} from '../api';

@injectable()
export default class SubscriptionServiceImpl implements SubscriptionService {
  @inject(GRPC_CLIENT_TYPES.SubscriptionClient)
  private readonly subscriptionClient: SubscriptionClient;

  subscribe(lobbyId: number, memberId: number): Promise<LobbyEvent> {
    return new Promise<LobbyEvent>((resolve, reject) => {
      this.subscriptionClient
        .subscribe(lobbyId, memberId, resolve)
        .catch(reject);
    });
  }
}
