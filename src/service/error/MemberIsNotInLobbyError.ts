import ServiceError from "./ServiceError";

export default class MemberIsNotInLobbyError extends ServiceError {

    private static readonly USER_MESSAGE = "You are not included into any lobby.";

    constructor(memberName: string) {
        super(`User '${ memberName }' is not included into any lobby.`);
        Object.setPrototypeOf(this, MemberIsNotInLobbyError.prototype);
    }

    getUserMessage(): string {
        return MemberIsNotInLobbyError.USER_MESSAGE;
    }
}
