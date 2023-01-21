import { LobbyEvent } from "../event";

export default interface SubscriptionService {
    subscribe(lobbyId: number, memberId: number, next: (event: LobbyEvent) => void): void;
    unsubscribe(memberId: number): void;
    lobbySubscribe(lobbyId: number, next: (event: LobbyEvent) => void): void;
    lobbyUnsubscribe(lobbyId: number): void;
    register(lobbyId: number): void;
    unregister(lobbyId: number): void;
    dispatch(lobbyId: number, event: LobbyEvent): void;
}