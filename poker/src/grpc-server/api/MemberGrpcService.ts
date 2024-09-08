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
  );

  getMembersLobbyId(
    call: ServerUnaryCall<MemberIdRequest, NumberResponse>,
    callback: sendUnaryData<NumberResponse>
  );

  isMemberInLobby(
    call: ServerUnaryCall<MemberIdRequest, BoolResponse>,
    callback: sendUnaryData<BoolResponse>
  );

  putCard(
    call: ServerUnaryCall<MemberIdCardCodeRequest, void>,
    callback: sendUnaryData<void>
  );

  removeCard(
    call: ServerUnaryCall<MemberIdRequest, void>,
    callback: sendUnaryData<void>
  );
}
