import { Lobby } from "data/entity";

export default class PokerIsAlreadyStartedError extends Error {
    constructor(lobby: Lobby) {
        super(`Poker in lobby "${lobby.name}" is already started with theme "${lobby.currentTheme}"`);
    }
}
