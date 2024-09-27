import {
  sendUnaryData,
  ServerUnaryCall,
  ServerWritableStream,
} from '@grpc/grpc-js';

import {
  MemberIdLobbyIdRequest,
  MemberIdRequest,
  LobbyEvent,
  LobbyIdRequest,
  LobbyIdLobbyEventRequest,
} from '../dto';

export default interface SubscriptionGrpcService {
  subscribe(
    call: ServerWritableStream<MemberIdLobbyIdRequest, LobbyEvent>
  ): void;

  unsubscribe(
    call: ServerUnaryCall<MemberIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  register(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  unregister(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  dispatch(
    call: ServerUnaryCall<LobbyIdLobbyEventRequest, void>,
    callback: sendUnaryData<void>
  ): void;
}
