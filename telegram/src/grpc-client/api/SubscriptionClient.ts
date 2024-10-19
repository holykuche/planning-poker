import {LobbyEvent} from '../event';

export default interface SubscriptionClient {
  subscribe(
    lobbyId: number,
    memberId: number,
    next: (event: LobbyEvent) => void,
    handleError: (error: Error) => void
  ): Promise<void>;

  unsubscribe(memberId: number): Promise<void>;

  register(lobbyId: number): Promise<void>;

  unregister(lobbyId: number): Promise<void>;

  dispatch(lobbyId: number, event: LobbyEvent): Promise<void>;
}
