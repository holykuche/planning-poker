import ServiceError from "./ServiceError";

export default class LobbyAlreadyExists extends ServiceError {

    readonly lobbyName: string;

    constructor(lobbyName: string) {
        super(`Lobby with name '${ lobbyName }' already exists`);
        this.lobbyName = lobbyName;
        Object.setPrototypeOf(this, LobbyAlreadyExists.prototype);
    }

}