import { inject, injectable } from "inversify";

import { GRPC_CLIENT_TYPES, MemberClient } from "grpc-client/api";
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

    save(member: Member): Promise<Member> {
        return this.memberClient.save(member);
    }

    deleteById(memberId: number): Promise<void> {
        return this.memberClient.deleteById(memberId);
    }

}