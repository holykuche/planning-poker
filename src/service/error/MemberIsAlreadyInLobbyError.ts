import { Member, Lobby } from "data/entity";

export default class MemberIsAlreadyInLobbyError extends Error {
    constructor(member: Member, lobby: Lobby) {
        super(`User "${member.name}" is already included into lobby with name "${lobby.name}"`);
    }
}
