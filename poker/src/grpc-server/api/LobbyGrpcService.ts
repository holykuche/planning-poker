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
  );

  getByName(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  );

  createLobby(
    call: ServerUnaryCall<LobbyNameRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  );

  getMembersLobby(
    call: ServerUnaryCall<MemberIdRequest, Lobby>,
    callback: sendUnaryData<Lobby>
  );

  enterMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  );

  leaveMember(
    call: ServerUnaryCall<MemberIdLobbyIdRequest, void>,
    callback: sendUnaryData<void>
  );

  startPoker(
    call: ServerUnaryCall<LobbyIdThemeRequest, void>,
    callback: sendUnaryData<void>
  );

  cancelPoker(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  );
}
