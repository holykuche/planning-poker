import {sendUnaryData, ServerUnaryCall} from '@grpc/grpc-js';
import {inject, injectable} from 'inversify';

import {LobbyService, SERVICE_TYPES} from '@/service/api';

import {LobbyGrpcService} from '../api';
import {
  Lobby,
  LobbyIdRequest,
  LobbyIdThemeRequest,
  LobbyNameRequest,
  MemberIdLobbyIdRequest,
  MemberIdRequest,
} from '../dto';

import AbstractGrpcServiceImpl from './AbstractGrpcServiceImpl';

@injectable()
export default class LobbyGrpcServiceImpl
  extends AbstractGrpcServiceImpl
  implements LobbyGrpcService
{
  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  constructor() {
    super();
    this.getById = this.getById.bind(this);
    this.getByName = this.getByName.bind(this);
    this.createLobby = this.createLobby.bind(this);
    this.getMembersLobby = this.getMembersLobby.bind(this);
    this.enterMember = this.enterMember.bind(this);
    this.leaveMember = this.leaveMember.bind(this);
    this.startPoker = this.startPoker.bind(this);
    this.cancelPoker = this.cancelPoker.bind(this);
  }

  getById(
    call: ServerUnaryCall<LobbyIdRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ) {
    const {lobby_id} = call.request;

    this.lobbyService
      .getById(lobby_id)
      .then(lobby =>
        callback(null, {
          id: lobby.id,
          name: lobby.name,
          current_theme: lobby.current_theme,
          state: lobby.state,
        })
      )
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  getByName(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ) {
    const {lobby_name} = call.request;

    this.lobbyService
      .getByName(lobby_name)
      .then(lobby =>
        callback(null, {
          id: lobby.id,
          name: lobby.name,
          current_theme: lobby.current_theme,
          state: lobby.state,
        })
      )
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  createLobby(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ) {
    const {lobby_name} = call.request;

    this.lobbyService
      .createLobby(lobby_name)
      .then(lobby =>
        callback(null, {
          id: lobby.id,
          name: lobby.name,
          current_theme: lobby.current_theme,
          state: lobby.state,
        })
      )
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  getMembersLobby(
    call: ServerUnaryCall<MemberIdRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ) {
    const {member_id} = call.request;

    this.lobbyService
      .getMembersLobby(member_id)
      .then(lobby =>
        callback(null, {
          id: lobby.id,
          name: lobby.name,
          current_theme: lobby.current_theme,
          state: lobby.state,
        })
      )
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  enterMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {lobby_id, member_id} = call.request;

    this.lobbyService
      .enterMember(member_id, lobby_id)
      .then(() => callback(null))
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  leaveMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {lobby_id, member_id} = call.request;

    this.lobbyService
      .leaveMember(member_id, lobby_id)
      .then(() => callback(null))
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  startPoker(
    call: ServerUnaryCall<LobbyIdThemeRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {lobby_id, theme} = call.request;

    this.lobbyService
      .startPoker(lobby_id, theme)
      .then(() => callback(null))
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  cancelPoker(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {lobby_id} = call.request;

    this.lobbyService
      .cancelPoker(lobby_id)
      .then(() => callback(null))
      .catch(error =>
        callback(LobbyGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }
}
