import { CardCode } from "../enum";
import { MemberCardXref } from "../entity";

export default interface MemberCardXrefDAO {

    getCardByMemberId(memberId: number): CardCode;

    getCardsByMemberIds(memberIds: number[]): MemberCardXref[];

    put(memberId: number, cardCode: CardCode): void;

    removeByMemberId(memberId: number): void;

    removeByMemberIds(memberIds: number[]): void;

}