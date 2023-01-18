import { Member } from "data/entity";

export default class MemberIsNotInLobbyError extends Error {
    constructor(member: Member) {
        super(`User "${member.name}" is not included into any lobby`);
    }

}
