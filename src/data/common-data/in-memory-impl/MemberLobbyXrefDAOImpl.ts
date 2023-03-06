import { injectable } from "inversify";

import { AbstractInMemoryDAOImpl } from "data/base-data/in-memory-impl";

import { MemberLobbyXrefDAO } from "../api";
import { MemberLobbyXref } from "../entity";

@injectable()
export default class MemberLobbyXrefDAOImpl extends AbstractInMemoryDAOImpl<MemberLobbyXref> implements MemberLobbyXrefDAO {

    constructor() {
        super({
            indexBy: [ "memberId", "lobbyId" ],
        });
    }

    getMembersBinding(memberId: number): number {
        return this.find("memberId", memberId)?.lobbyId || null;
    }

    getMemberIdsByLobbyId(lobbyId: number): number[] {
        return this.findMany("lobbyId", lobbyId)
            .map(xref => xref.memberId);
    }

    bindMember(memberId: number, lobbyId: number): void {
        this.save({ memberId, lobbyId });
    }

    unbindMember(memberId: number): void {
        this.delete("memberId", memberId);
    }

    isMemberBound(memberId: number): boolean {
        return !!this.find("memberId", memberId);
    }

    unbindMembers(lobbyId: number): void {
        this.delete("lobbyId", lobbyId);
    }

}