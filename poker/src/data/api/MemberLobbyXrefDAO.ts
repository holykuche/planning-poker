export default interface MemberLobbyXrefDAO {
  getMembersBinding(memberId: number): Promise<number>;

  getMemberIdsByLobbyId(lobbyId: number): Promise<number[]>;

  bindMember(memberId: number, lobbyId: number): Promise<void>;

  unbindMember(memberId: number): Promise<void>;

  unbindMembers(lobbyId: number): Promise<void>;

  isMemberBound(memberId: number): Promise<boolean>;
}
