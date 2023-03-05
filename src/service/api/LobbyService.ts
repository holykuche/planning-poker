import { Member, Lobby } from "data/entity";

export default interface LobbyService {
    getById(id: number): Lobby;

    getByName(name: string): Lobby;

    createLobby(lobbyName: string): Lobby;

    getMembers(lobbyId: number): Member[];

    getMembersLobby(memberId: number): Lobby;

    enterMember(memberId: number, lobbyId: number): void;

    leaveMember(memberId: number, lobbyId: number): void;

    startPoker(lobbyId: number, theme: string): void;

    cancelPoker(lobbyId: number): void;
}
