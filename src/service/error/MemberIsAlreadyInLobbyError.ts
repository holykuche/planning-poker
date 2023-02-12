import ServiceError from "./ServiceError";

export default class MemberIsAlreadyInLobbyError extends ServiceError {

    private static readonly USER_MESSAGE = "You are already a member of a lobby.";

    constructor(memberName: string) {
        super(`User '${ memberName }' is already included into lobby.`);
        Object.setPrototypeOf(this, MemberIsAlreadyInLobbyError.prototype);
    }

    getUserMessage(): string {
        return MemberIsAlreadyInLobbyError.USER_MESSAGE;
    }
}
