import { injectable } from "inversify";

import { MemberCardXrefDAO } from "../api";
import { CardCode } from "../enum";

@injectable()
export default class MemberCardXrefDAOImpl implements MemberCardXrefDAO {

    private memberCardXref = new Map<number, CardCode>();

    getByMemberId(memberId: number): CardCode {
        return this.memberCardXref.get(memberId);
    }

    getByMemberIds(memberIds: number[]): [ number, CardCode ][] {
        return memberIds.reduce((arr, id) => [ ...arr, [ id, this.memberCardXref.get(id) ] ], []);
    }

    put(memberId: number, cardCode: CardCode): void {
        this.memberCardXref.set(memberId, cardCode);
    }

    removeByMemberId(memberId: number): void {
        this.memberCardXref.delete(memberId);
    }

    removeByMemberIds(memberIds: number[]): void {
        memberIds.forEach(memberId => this.memberCardXref.delete(memberId));
    }

}