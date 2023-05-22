import { Lobby } from "data/entity";

export default interface LobbyService {

    getById(id: number): Promise<Lobby>;

    getByName(name: string): Promise<Lobby>;

    createLobby(lobbyName: string): Promise<Lobby>;

    getMembersLobby(memberId: number): Promise<Lobby>;

    enterMember(memberId: number, lobbyId: number): Promise<void>;

    leaveMember(memberId: number, lobbyId: number): Promise<void>;

    startPoker(lobbyId: number, theme: string): Promise<void>;

    cancelPoker(lobbyId: number): Promise<void>;

}