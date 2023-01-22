import ServiceError from "./ServiceError";

export default class UnknownMemberError extends ServiceError {

    private static readonly USER_MESSAGE = "Sorry, I don't know you";

    constructor() {
        super("Unknown member");
        Object.setPrototypeOf(this, UnknownMemberError.prototype);
    }

    getUserMessage(): string {
        return UnknownMemberError.USER_MESSAGE;
    }
}