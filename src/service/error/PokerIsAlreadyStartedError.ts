import { Lobby } from "data/entity";
import ServiceError from "./ServiceError";

export default class PokerIsAlreadyStartedError extends ServiceError {

    constructor(lobby: Lobby) {
        super(`Poker in lobby "${lobby.name}" is already started with theme "${lobby.currentTheme}".`);
        Object.setPrototypeOf(this, PokerIsAlreadyStartedError.prototype);
    }

    getUserMessage(): string {
        return this.message;
    }
}
