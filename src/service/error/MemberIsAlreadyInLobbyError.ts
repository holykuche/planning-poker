import ServiceError from "./ServiceError";

export default class MemberIsAlreadyInLobbyError extends ServiceError {

    readonly memberName: string;

    constructor(memberName: string) {
        super(`User '${ memberName }' is already included into lobby.`);
        this.memberName = memberName;
        Object.setPrototypeOf(this, MemberIsAlreadyInLobbyError.prototype);
    }
}
