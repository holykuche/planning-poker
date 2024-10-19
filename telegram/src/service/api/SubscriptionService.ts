import {LobbyEvent} from '@/grpc-client/event';

export default interface SubscriptionService {
  subscribe(
    lobbyId: number,
    memberId: number,
    next: (event: LobbyEvent) => void
  ): Promise<void>;
}
