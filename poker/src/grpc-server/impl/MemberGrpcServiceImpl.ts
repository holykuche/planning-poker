import { injectable, inject } from "inversify";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import { MemberService, SERVICE_TYPES } from "service/api";

import { MemberIdRequest, Member, NumberResponse, BoolResponse, MemberIdCardCodeRequest } from "../dto";
import { MemberGrpcService } from "../api";

@injectable()
export default class MemberGrpcServiceImpl implements MemberGrpcService {

    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    getById(
        call: ServerUnaryCall<MemberIdRequest, Member>,
        callback: sendUnaryData<Member>,
    ) {
        const { member_id } = call.request;

        this.memberService
            .getById(member_id)
            .then(member => callback(null, member))
            .catch(error => callback(error));
    }

    getMembersLobbyId(
        call: ServerUnaryCall<MemberIdRequest, NumberResponse>,
        callback: sendUnaryData<NumberResponse>,
    ) {
        const { member_id } = call.request;

        this.memberService
            .getMembersLobbyId(member_id)
            .then(lobbyId => callback(null, { result: lobbyId }))
            .catch(error => callback(error));
    }

    isMemberInLobby(
        call: ServerUnaryCall<MemberIdRequest, BoolResponse>,
        callback: sendUnaryData<BoolResponse>,
    ) {
        const { member_id } = call.request;

        this.memberService
            .isMemberInLobby(member_id)
            .then(isMemberInLobby => callback(null, { result: isMemberInLobby }))
            .catch(error => callback(error));
    }

    putCard(
        call: ServerUnaryCall<MemberIdCardCodeRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { card_code, member_id } = call.request;

        this.memberService
            .putCard(member_id, card_code)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    removeCard(
        call: ServerUnaryCall<MemberIdRequest, void>,
        callback: sendUnaryData<void>,
    ) {
        const { member_id } = call.request;

        this.memberService
            .removeCard(member_id)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

}