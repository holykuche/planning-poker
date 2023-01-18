import { injectable } from "inversify";
import { Subject, Subscription } from "rxjs";

import { SubscriptionService } from "../api";
import { LobbyEvent } from "../event";

@injectable()
export default class SubscriptionServiceImpl implements SubscriptionService {

    private lobbyObservables$ = new Map<number, Subject<LobbyEvent>>();
    private memberSubscriptions = new Map<number, Subscription>();

    subscribe(lobbyId: number, memberId: number, next: (event: LobbyEvent) => void): void {
        const subscription = this.lobbyObservables$.get(lobbyId).subscribe(next);
        this.memberSubscriptions.set(memberId, subscription);
    }

    unsubscribe(memberId: number): void {
        this.memberSubscriptions.get(memberId).unsubscribe();
        this.memberSubscriptions.delete(memberId);
    }

    register(lobbyId: number): void {
        this.lobbyObservables$.set(lobbyId, new Subject<LobbyEvent>());
    }

    unregister(lobbyId: number): void {
        this.lobbyObservables$.get(lobbyId).complete();
        this.lobbyObservables$.delete(lobbyId);
    }

    dispatch(lobbyId: number, event: LobbyEvent): void {
        this.lobbyObservables$.get(lobbyId).next(event);
    }

}