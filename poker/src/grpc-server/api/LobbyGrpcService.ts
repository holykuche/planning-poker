import {sendUnaryData, ServerUnaryCall} from '@grpc/grpc-js';

import {
  Lobby,
  LobbyIdRequest,
  LobbyIdThemeRequest,
  LobbyNameRequest,
  MemberIdLobbyIdRequest,
  MemberIdRequest,
} from '../dto';

export default interface LobbyGrpcService {
  getById(
    call: ServerUnaryCall<LobbyIdRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ): void;

  getByName(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ): void;

  createLobby(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ): void;

  getMembersLobby(
    call: ServerUnaryCall<MemberIdRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  ): void;

  enterMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  leaveMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  startPoker(
    call: ServerUnaryCall<LobbyIdThemeRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  cancelPoker(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;
}
