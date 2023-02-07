import { Member, Lobby } from "data/entity";

import { PokerResultItemDto } from "../dto";

export default interface LobbyService {
    getById(id: number): Lobby;
    getByName(name: string): Lobby;
    getMembers(lobbyId: number): Member[];
    getMembersLobby(memberId: number): Lobby;
    enterMember(memberId: number, lobbyName: string): void;
    leaveMember(memberId: number): void;
    startPoker(lobbyId: number, theme: string): void;
    checkPoker(lobbyId: number): void;
    finishPoker(lobbyId: number): void;
    getPokerResult(lobbyId: number): PokerResultItemDto[];
    scheduleLobbyDestroy(lobbyId: number): void;
}
