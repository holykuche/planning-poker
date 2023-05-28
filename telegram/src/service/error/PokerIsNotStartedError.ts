import { Lobby } from "service/entity";
import ServiceError from "./ServiceError";
import ErrorType from "./ErrorType";

export default class PokerIsNotStartedError extends ServiceError {

    readonly lobbyName: string;

    constructor(lobby: Lobby) {
        super(ErrorType.PokerIsNotStarted, `Poker in lobby '${ lobby.name }' is not started.`);
        this.lobbyName = lobby.name;
        Object.setPrototypeOf(this, PokerIsNotStartedError.prototype);
    }
}
