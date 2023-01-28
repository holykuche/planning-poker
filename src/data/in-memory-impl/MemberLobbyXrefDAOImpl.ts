import { injectable } from "inversify";
import { MemberLobbyXrefDAO } from "../api";

@injectable()
export default class MemberLobbyXrefDAOImpl implements MemberLobbyXrefDAO {

    private memberLobbyXref = new Map<number, number>();
    private lobbyMemberXref = new Map<number, number[]>();

    getMembersBinding(memberId: number): number {
        return this.memberLobbyXref.get(memberId);
    }

    getMemberIdsByLobbyId(lobbyId: number): number[] {
        return this.lobbyMemberXref.get(lobbyId) || [];
    }

    bindMember(memberId: number, lobbyId: number): void {
        this.memberLobbyXref.set(memberId, lobbyId);
        this.lobbyMemberXref.set(lobbyId, [ ...this.lobbyMemberXref.get(lobbyId) || [], memberId ]);
    }

    unbindMember(memberId: number): void {
        const lobbyId = this.memberLobbyXref.get(memberId);
        this.memberLobbyXref.delete(memberId);

        const memberIds = this.lobbyMemberXref.get(lobbyId).filter(mId => mId !== memberId);
        if (memberIds.length) {
            this.lobbyMemberXref.set(lobbyId, memberIds);
        } else {
            this.lobbyMemberXref.delete(lobbyId);
        }
    }

    isMemberBound(memberId: number): boolean {
        return this.memberLobbyXref.has(memberId);
    }

    unbindMembers(lobbyId: number): void {
        const memberIds = this.lobbyMemberXref.has(lobbyId);
        if (memberIds) {
            this.lobbyMemberXref.get(lobbyId).forEach(mId => this.memberLobbyXref.delete(mId));
            this.lobbyMemberXref.delete(lobbyId);
        }
    }

}