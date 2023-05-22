import ServiceError from "./ServiceError";
import ErrorType from "./ErrorType";

export default class MemberIsAlreadyInLobbyError extends ServiceError {

    readonly memberName: string;

    constructor(memberName: string) {
        super(ErrorType.MemberIsAlreadyInLobby, `User '${ memberName }' is already included into lobby.`);
        this.memberName = memberName;
        Object.setPrototypeOf(this, MemberIsAlreadyInLobbyError.prototype);
    }
}
