import {injectable} from 'inversify';
import {Subject, Subscription} from 'rxjs';

import {SubscriptionService} from '../api';
import {LobbyEvent} from '../event';

@injectable()
export default class SubscriptionServiceImpl implements SubscriptionService {
  private lobbies$ = new Map<number, Subject<LobbyEvent>>();
  private memberSubscriptions = new Map<number, Subscription>();

  subscribe(
    lobbyId: number,
    memberId: number,
    next: (event: LobbyEvent) => void
  ): void {
    const lobby$ = this.lobbies$.get(lobbyId) || this.register(lobbyId);
    const subscription = lobby$.subscribe(next);
    this.memberSubscriptions.set(memberId, subscription);
  }

  unsubscribe(memberId: number): void {
    this.memberSubscriptions.get(memberId).unsubscribe();
    this.memberSubscriptions.delete(memberId);
  }

  register(lobbyId: number): Subject<LobbyEvent> {
    const lobby$ = new Subject<LobbyEvent>();
    this.lobbies$.set(lobbyId, lobby$);
    return lobby$;
  }

  unregister(lobbyId: number): void {
    this.lobbies$.get(lobbyId).complete();
    this.lobbies$.delete(lobbyId);
  }

  dispatch(lobbyId: number, event: LobbyEvent): void {
    this.lobbies$.get(lobbyId).next(event);
  }
}
