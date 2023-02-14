import { Lobby } from "data/entity";
import ServiceError from "./ServiceError";

export default class PokerIsNotStartedError extends ServiceError {

    readonly lobbyName: string;

    constructor(lobby: Lobby) {
        super(`Poker in lobby '${ lobby.name }' is not started.`);
        this.lobbyName = lobby.name;
        Object.setPrototypeOf(this, PokerIsNotStartedError.prototype);
    }
}
