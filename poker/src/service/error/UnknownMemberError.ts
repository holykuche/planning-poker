import ServiceError from "./ServiceError";
import ErrorType from "./ErrorType";

export default class UnknownMemberError extends ServiceError {

    constructor() {
        super(ErrorType.UnknownMember, "Unknown member.");
        Object.setPrototypeOf(this, UnknownMemberError.prototype);
    }
}
