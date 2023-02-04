import { Member, Lobby } from "data/entity";

import { PokerResultItemDto, CardDto } from "../dto";

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
    getPokerFinishResult(lobbyId: number): { result: PokerResultItemDto[], totalScore: CardDto };
}
