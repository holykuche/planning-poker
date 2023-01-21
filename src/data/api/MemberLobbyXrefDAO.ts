export default interface MemberLobbyXrefDAO {
    getMembersBinding(memberId: number): number;
    getMemberIdsByLobbyId(lobbyId: number): number[];
    bindMember(memberId: number, lobbyId: number): void;
    unbindMember(memberId: number): void;
    unbindMembers(lobbyId: number): void;
    isMemberBound(memberId: number): boolean;
}