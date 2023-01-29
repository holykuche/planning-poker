import ServiceError from "./ServiceError";

export default class UnknownMemberError extends ServiceError {

    private static readonly USER_MESSAGE = "You are not a member of any lobby. Type /help for get a help message.";

    constructor() {
        super("Unknown member.");
        Object.setPrototypeOf(this, UnknownMemberError.prototype);
    }

    getUserMessage(): string {
        return UnknownMemberError.USER_MESSAGE;
    }
}
