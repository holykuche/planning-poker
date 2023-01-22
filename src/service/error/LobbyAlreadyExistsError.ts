import ServiceError from "./ServiceError";

export default class LobbyAlreadyExistsError extends ServiceError {

    constructor(lobbyName: string) {
        super(`Lobby with name "${lobbyName}" already exists`);
        Object.setPrototypeOf(this, LobbyAlreadyExistsError.prototype);
    }

    getUserMessage(): string {
        return this.message;
    }
}
