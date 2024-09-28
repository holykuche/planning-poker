import {LobbyEvent} from '@/grpc-client/event';

export default interface SubscriptionService {
  subscribe(lobbyId: number, memberId: number): Promise<LobbyEvent>;
}
