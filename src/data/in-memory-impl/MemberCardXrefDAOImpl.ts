import { injectable } from "inversify";

import { MemberCardXrefDAO } from "../api";
import { MemberCardXref } from "../entity";
import { CardCode } from "../enum";

import AbstractInMemoryDAOImpl from "./AbstractInMemoryDAOImpl";

@injectable()
export default class MemberCardXrefDAOImpl extends AbstractInMemoryDAOImpl<MemberCardXref> implements MemberCardXrefDAO {

    constructor() {
        super({
            indexBy: [ "memberId" ],
        });
    }

    getCardByMemberId(memberId: number): CardCode {
        return this.find("memberId", memberId)?.cardCode || null;
    }

    getCardsByMemberIds(memberIds: number[]): MemberCardXref[] {
        return memberIds
            .map(mId => this.find("memberId", mId))
            .filter(xref => !!xref);
    }

    put(memberId: number, cardCode: CardCode): void {
        this.save({ memberId, cardCode });
    }

    removeByMemberId(memberId: number): void {
        this.delete("memberId", memberId);
    }

    removeByMemberIds(memberIds: number[]): void {
        memberIds.forEach(memberId => this.removeByMemberId(memberId));
    }

}