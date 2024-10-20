import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, SubscriptionClient} from '@/grpc-client/api';
import {LobbyEvent} from '@/grpc-client/event';

import {SubscriptionService} from '../api';

@injectable()
export default class SubscriptionServiceImpl implements SubscriptionService {
  @inject(GRPC_CLIENT_TYPES.SubscriptionClient)
  private readonly subscriptionClient: SubscriptionClient;

  subscribe(
    lobby_id: number,
    member_id: number,
    next: (event: LobbyEvent) => void
  ): Promise<void> {
    return this.subscriptionClient.subscribe(
      lobby_id,
      member_id,
      next,
      error => {
        // todo: need to pass error handler from above
        throw error;
      }
    );
  }
}
