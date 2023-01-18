export default class MemberDoesntExist extends Error {
    constructor() {
        super("Member doesn't exist");
    }
}