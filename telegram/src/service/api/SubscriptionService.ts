import {LobbyEvent} from '../event';

export default interface SubscriptionService {
  subscribe(lobbyId: number, memberId: number): Promise<LobbyEvent>;
}
