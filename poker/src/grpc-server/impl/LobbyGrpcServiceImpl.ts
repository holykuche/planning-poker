import { inject, injectable } from "inversify";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";

import { LobbyService, SERVICE_TYPES } from "service/api";

import {
    Lobby,
    LobbyIdRequest,
    LobbyIdThemeRequest,
    LobbyNameRequest,
    MemberIdLobbyIdRequest,
    MemberIdRequest,
} from "../dto";
import { LobbyGrpcService } from "../api";

@injectable()
export default class LobbyGrpcServiceImpl implements LobbyGrpcService {

    @inject(SERVICE_TYPES.LobbyService)
    private readonly lobbyService: LobbyService;

    getById(
        call: ServerUnaryCall<LobbyIdRequest, Lobby>,
        callback: sendUnaryData<Lobby>,
    ) {
        const { lobby_id } = call.request;

        this.lobbyService
            .getById(lobby_id)
            .then(lobby => callback(
                null,
                {
                    id: lobby.id,
                    name: lobby.name,
                    current_theme: lobby.currentTheme,
                    state: lobby.state,
                }))
            .catch(error => callback(error));
    }

    getByName(
        call: ServerUnaryCall<LobbyNameRequest, Lobby>,
        callback: sendUnaryData<Lobby>,
    ) {
        const { lobby_name } = call.request;

        this.lobbyService
            .getByName(lobby_name)
            .then(lobby => callback(
                null,
                {
                    id: lobby.id,
                    name: lobby.name,
                    current_theme: lobby.currentTheme,
                    state: lobby.state,
                }))
            .catch(error => callback(error));
    }

    createLobby(
        call: ServerUnaryCall<LobbyNameRequest, Lobby>,
        callback: sendUnaryData<Lobby>,
    ) {
        const { lobby_name } = call.request;

        this.lobbyService
            .createLobby(lobby_name)
            .then(lobby => callback(
                null,
                {
                    id: lobby.id,
                    name: lobby.name,
                    current_theme: lobby.currentTheme,
                    state: lobby.state,
                },
            ))
            .catch(error => callback(error));
    }

    getMembersLobby(
        call: ServerUnaryCall<MemberIdRequest, Lobby>,
        callback: sendUnaryData<Lobby>,
    ) {
        const { member_id } = call.request;

        this.lobbyService
            .getMembersLobby(member_id)
            .then(lobby => callback(
                null,
                {
                    id: lobby.id,
                    name: lobby.name,
                    current_theme: lobby.currentTheme,
                    state: lobby.state,
                },
            ))
            .catch(error => callback(error));
    }

    enterMember(
        call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { lobby_id, member_id } = call.request;

        this.lobbyService
            .enterMember(member_id, lobby_id)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    leaveMember(
        call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { lobby_id, member_id } = call.request;

        this.lobbyService
            .leaveMember(member_id, lobby_id)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    startPoker(
        call: ServerUnaryCall<LobbyIdThemeRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { lobby_id, theme } = call.request;

        this.lobbyService
            .startPoker(lobby_id, theme)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    cancelPoker(
        call: ServerUnaryCall<LobbyIdRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { lobby_id } = call.request;

        this.lobbyService
            .cancelPoker(lobby_id)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

}