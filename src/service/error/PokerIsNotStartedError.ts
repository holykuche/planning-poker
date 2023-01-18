import { Lobby } from "data/entity";

export default class PokerIsNotStartedError extends Error {
    constructor(lobby: Lobby) {
        super(`Poker in lobby "${lobby.name}" is not started yet`);
    }
}
