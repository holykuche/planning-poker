import { Member } from "grpc-client/entity";
import { CardCode } from "grpc-client/enum";

export default interface MemberService {

    getById(memberId: number): Promise<Member>;

    getMembersLobbyId(memberId: number): Promise<number>;

    isMemberInLobby(memberId: number): Promise<boolean>;

    putCard(memberId: number, cardCode: CardCode): Promise<void>;

    removeCard(memberId: number): Promise<void>;

    save(member: Member): Promise<Member>;

    deleteById(memberId: number): Promise<void>;

}
