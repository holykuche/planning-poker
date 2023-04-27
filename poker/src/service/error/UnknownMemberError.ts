import ServiceError from "./ServiceError";

export default class UnknownMemberError extends ServiceError {

    constructor() {
        super("Unknown member.");
        Object.setPrototypeOf(this, UnknownMemberError.prototype);
    }
}
