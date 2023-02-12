import ServiceError from "./ServiceError";

export default class LobbyAlreadyExists extends ServiceError {

    constructor(lobbyName: string) {
        super(`Lobby with name '${ lobbyName }'`);
        Object.setPrototypeOf(this, LobbyAlreadyExists.prototype);
    }

    getUserMessage(): string {
        return this.message;
    }

}