import {sendUnaryData, ServerUnaryCall} from '@grpc/grpc-js';
import {inject, injectable} from 'inversify';

import {MemberService, SERVICE_TYPES} from '@/service/api';

import {MemberGrpcService} from '../api';
import {
  BoolResponse,
  Member,
  MemberIdCardCodeRequest,
  MemberIdRequest,
  NumberResponse,
} from '../dto';

import AbstractGrpcServiceImpl from './AbstractGrpcServiceImpl';

@injectable()
export default class MemberGrpcServiceImpl
  extends AbstractGrpcServiceImpl
  implements MemberGrpcService
{
  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  constructor() {
    super();
    this.getById = this.getById.bind(this);
    this.getMembersLobbyId = this.getMembersLobbyId.bind(this);
    this.isMemberInLobby = this.isMemberInLobby.bind(this);
    this.putCard = this.putCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
  }

  getById(
    call: ServerUnaryCall<MemberIdRequest, Member>,
    callback: sendUnaryData<Member>
  ) {
    const {member_id} = call.request;

    this.memberService
      .getById(member_id)
      .then(member => callback(null, member))
      .catch(error =>
        callback(MemberGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  getMembersLobbyId(
    call: ServerUnaryCall<MemberIdRequest, NumberResponse>,
    callback: sendUnaryData<NumberResponse>
  ) {
    const {member_id} = call.request;

    this.memberService
      .getMembersLobbyId(member_id)
      .then(lobbyId => callback(null, {result: lobbyId}))
      .catch(error =>
        callback(MemberGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  isMemberInLobby(
    call: ServerUnaryCall<MemberIdRequest, BoolResponse>,
    callback: sendUnaryData<BoolResponse>
  ) {
    const {member_id} = call.request;

    this.memberService
      .isMemberInLobby(member_id)
      .then(isMemberInLobby => callback(null, {result: isMemberInLobby}))
      .catch(error =>
        callback(MemberGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  putCard(
    call: ServerUnaryCall<MemberIdCardCodeRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {card_code, member_id} = call.request;

    this.memberService
      .putCard(member_id, card_code)
      .then(() => callback(null))
      .catch(error =>
        callback(MemberGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }

  removeCard(
    call: ServerUnaryCall<MemberIdRequest, void>,
    callback: sendUnaryData<void>
  ) {
    const {member_id} = call.request;

    this.memberService
      .removeCard(member_id)
      .then(() => callback(null))
      .catch(error =>
        callback(MemberGrpcServiceImpl.fromServiceErrorToGrpcError(error))
      );
  }
}
