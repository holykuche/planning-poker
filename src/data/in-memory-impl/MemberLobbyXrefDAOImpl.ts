import { injectable } from "inversify";
import { MemberLobbyXrefDAO } from "../api";

@injectable()
export default class MemberLobbyXrefDAOImpl implements MemberLobbyXrefDAO {

    private MEMBER_LOBBY_XREF = new Map<number, number>();
    private LOBBY_MEMBER_XREF = new Map<number, number[]>();

    getMembersBinding(memberId: number): number {
        return this.MEMBER_LOBBY_XREF.get(memberId);
    }

    getMemberIdsByLobbyId(lobbyId: number): number[] {
        return this.LOBBY_MEMBER_XREF.get(lobbyId) || [];
    }

    bindMember(memberId: number, lobbyId: number): void {
        this.MEMBER_LOBBY_XREF.set(memberId, lobbyId);
        this.LOBBY_MEMBER_XREF.set(lobbyId, [ ...this.LOBBY_MEMBER_XREF.get(lobbyId) || [], memberId ]);
    }

    unbindMember(memberId: number): void {
        const lobbyId = this.MEMBER_LOBBY_XREF.get(memberId);
        this.MEMBER_LOBBY_XREF.delete(memberId);

        const memberIds = this.LOBBY_MEMBER_XREF.get(lobbyId).filter(mId => mId !== memberId);
        if (memberIds.length) {
            this.LOBBY_MEMBER_XREF.set(lobbyId, memberIds);
        } else {
            this.LOBBY_MEMBER_XREF.delete(lobbyId);
        }
    }

    isMemberBound(memberId: number): boolean {
        return this.MEMBER_LOBBY_XREF.has(memberId);
    }

    unbindMembers(lobbyId: number): void {
        const memberIds = this.LOBBY_MEMBER_XREF.has(lobbyId);
        if (memberIds) {
            this.LOBBY_MEMBER_XREF.get(lobbyId).forEach(mId => this.MEMBER_LOBBY_XREF.delete(mId));
            this.LOBBY_MEMBER_XREF.delete(lobbyId);
        }
    }

}