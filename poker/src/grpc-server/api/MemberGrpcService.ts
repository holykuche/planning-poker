import {sendUnaryData, ServerUnaryCall} from '@grpc/grpc-js';

import {
  BoolResponse,
  Member,
  MemberIdCardCodeRequest,
  MemberIdRequest,
  NumberResponse,
} from '../dto';

export default interface MemberGrpcService {
  getById(
    call: ServerUnaryCall<MemberIdRequest, Member>,
    callback: sendUnaryData<Member>
  ): void;

  getMembersLobbyId(
    call: ServerUnaryCall<MemberIdRequest, NumberResponse>,
    callback: sendUnaryData<NumberResponse>
  ): void;

  isMemberInLobby(
    call: ServerUnaryCall<MemberIdRequest, BoolResponse>,
    callback: sendUnaryData<BoolResponse>
  ): void;

  putCard(
    call: ServerUnaryCall<MemberIdCardCodeRequest, void>,
    callback: sendUnaryData<void>
  ): void;

  removeCard(
    call: ServerUnaryCall<MemberIdRequest, void>,
    callback: sendUnaryData<void>
  ): void;
}
