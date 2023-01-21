import { injectable } from "inversify";
import { Subject, Subscription } from "rxjs";

import { SubscriptionService } from "../api";
import { LobbyEvent } from "../event";

@injectable()
export default class SubscriptionServiceImpl implements SubscriptionService {

    private LOBBY_OBSERVABLES$ = new Map<number, Subject<LobbyEvent>>();
    private LOBBY_SUBSCRIPTIONS = new Map<number, Subscription>();
    private MEMBER_SUBSCRIPTIONS = new Map<number, Subscription>();

    subscribe(lobbyId: number, memberId: number, next: (event: LobbyEvent) => void): void {
        const subscription = this.LOBBY_OBSERVABLES$.get(lobbyId).subscribe(next);
        this.MEMBER_SUBSCRIPTIONS.set(memberId, subscription);
    }

    unsubscribe(memberId: number): void {
        this.MEMBER_SUBSCRIPTIONS.get(memberId).unsubscribe();
        this.MEMBER_SUBSCRIPTIONS.delete(memberId);
    }

    lobbySubscribe(lobbyId: number, next: (event: LobbyEvent) => void): void {
        const subscription = this.LOBBY_OBSERVABLES$.get(lobbyId).subscribe(next);
        this.LOBBY_SUBSCRIPTIONS.set(lobbyId, subscription);
    }

    lobbyUnsubscribe(lobbyId: number): void {
        this.MEMBER_SUBSCRIPTIONS.get(lobbyId).unsubscribe();
        this.MEMBER_SUBSCRIPTIONS.delete(lobbyId);
    }

    register(lobbyId: number): void {
        this.LOBBY_OBSERVABLES$.set(lobbyId, new Subject<LobbyEvent>());
    }

    unregister(lobbyId: number): void {
        this.LOBBY_SUBSCRIPTIONS.get(lobbyId)?.unsubscribe();
        this.LOBBY_SUBSCRIPTIONS.delete(lobbyId);

        this.LOBBY_OBSERVABLES$.get(lobbyId).complete();
        this.LOBBY_OBSERVABLES$.delete(lobbyId);
    }

    dispatch(lobbyId: number, event: LobbyEvent): void {
        this.LOBBY_OBSERVABLES$.get(lobbyId).next(event);
    }

}