import { injectable, inject } from "inversify";

import { LobbyClient, GRPC_CLIENT_TYPES } from "grpc-client/api";
import { Lobby as ProtobufLobby } from "grpc-client/entity";

import { LobbyService } from "../api";
import { Lobby } from "../entity";

@injectable()
export default class LobbyServiceImpl implements LobbyService {

    @inject(GRPC_CLIENT_TYPES.LobbyClient)
    private readonly lobbyClient: LobbyClient;

    getById(id: number): Promise<Lobby> {
        return this.lobbyClient.getById(id)
            .then(LobbyServiceImpl.deserializeLobby);
    }

    getByName(name: string): Promise<Lobby> {
        return this.lobbyClient.getByName(name)
            .then(LobbyServiceImpl.deserializeLobby);
    }

    createLobby(lobbyName: string): Promise<Lobby> {
        return this.lobbyClient.createLobby(lobbyName)
            .then(LobbyServiceImpl.deserializeLobby);
    }

    getMembersLobby(memberId: number): Promise<Lobby> {
        return this.lobbyClient.getMembersLobby(memberId)
            .then(LobbyServiceImpl.deserializeLobby);
    }

    enterMember(memberId: number, lobbyId: number): Promise<void> {
        return this.lobbyClient.enterMember(memberId, lobbyId);
    }

    leaveMember(memberId: number, lobbyId: number): Promise<void> {
        return this.lobbyClient.leaveMember(memberId, lobbyId);
    }

    startPoker(lobbyId: number, theme: string): Promise<void> {
        return this.startPoker(lobbyId, theme);
    }

    cancelPoker(lobbyId: number): Promise<void> {
        return this.cancelPoker(lobbyId);
    }

    private static deserializeLobby(lobby: ProtobufLobby): Lobby {
        return {
            id: lobby.id,
            name: lobby.name,
            currentTheme: lobby.current_theme,
            state: lobby.state,
        };
    }

}