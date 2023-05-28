import { injectable, inject } from "inversify";

import { MemberClient, GRPC_CLIENT_TYPES } from "grpc-client/api";
import { Member } from "grpc-client/entity";
import { CardCode } from "grpc-client/enum";

import { MemberService } from "../api";

@injectable()
export default class MemberServiceImpl implements MemberService {

    @inject(GRPC_CLIENT_TYPES.MemberClient)
    private readonly memberClient: MemberClient;

    getById(memberId: number): Promise<Member> {
        return this.memberClient.getById(memberId);
    }

    getMembersLobbyId(memberId: number): Promise<number> {
        return this.memberClient.getMembersLobbyId(memberId);
    }

    isMemberInLobby(memberId: number): Promise<boolean> {
        return this.memberClient.isMemberInLobby(memberId);
    }

    putCard(memberId: number, cardCode: CardCode): Promise<void> {
        return this.memberClient.putCard(memberId, cardCode);
    }

    removeCard(memberId: number): Promise<void> {
        return this.memberClient.removeCard(memberId);
    }

}