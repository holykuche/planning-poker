import { Member } from "data/entity";

export default class MemberIsAlreadyInLobbyError extends Error {
    constructor(member: Member) {
        super(`User "${member.name}" is already included into lobby`);
    }
}
