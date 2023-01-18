import Lobby from "data/entity/Lobby";

export default class LobbyAlreadyExistsError extends Error {
    constructor(lobby: Lobby) {
        super(`Lobby with name "${lobby.name}" already exists`);
    }
}
