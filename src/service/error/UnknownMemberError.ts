export default class UnknownMemberError extends Error {
    constructor() {
        super("Unknown member");
    }
}