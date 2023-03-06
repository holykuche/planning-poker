import { Member } from "data/common-data/entity";
import { CardCode } from "data/common-data/enum";

export default interface MemberService {
    getById(memberId: number): Member;

    getMembersLobbyId(memberId: number): number;

    isMemberInLobby(memberId: number): boolean;

    putCard(memberId: number, cardCode: CardCode): void;

    removeCard(memberId: number): void;
}