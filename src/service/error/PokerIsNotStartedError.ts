import { Lobby } from "data/entity";
import ServiceError from "./ServiceError";

export default class PokerIsNotStartedError extends ServiceError {

    constructor(lobby: Lobby) {
        super(`Poker in lobby "${lobby.name}" is not started.`);
        Object.setPrototypeOf(this, PokerIsNotStartedError.prototype);
    }

    getUserMessage(): string {
        return this.message;
    }
}
