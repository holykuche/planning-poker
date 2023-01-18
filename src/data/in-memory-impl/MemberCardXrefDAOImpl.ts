import { injectable } from "inversify";

import { MemberCardXrefDAO } from "../api";
import { CardCode } from "../enum";

@injectable()
export default class MemberCardXrefDAOImpl implements MemberCardXrefDAO {

    private MEMBER_CARD_XREF = new Map<number, CardCode>();

    getByMemberId(memberId: number): CardCode {
        return this.MEMBER_CARD_XREF.get(memberId);
    }

    getByMemberIds(memberIds: number[]): [ number, CardCode ][] {
        return memberIds.reduce((arr, id) => [ ...arr, [ id, this.MEMBER_CARD_XREF.get(id) ] ], []);
    }

    put(memberId: number, cardCode: CardCode): void {
        this.MEMBER_CARD_XREF.set(memberId, cardCode);
    }

    removeByMemberId(memberId: number): void {
        this.MEMBER_CARD_XREF.delete(memberId);
    }

    removeByMemberIds(memberIds: number[]): void {
        memberIds.forEach(memberId => this.MEMBER_CARD_XREF.delete(memberId));
    }

}