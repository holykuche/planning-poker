import { injectable } from "inversify";

import { MemberCardXrefDAO } from "../api";
import { MemberCardXref } from "../entity";
import { CardCode, TableName } from "../enum";

import AbstractDAOImpl from "./AbstractDAOImpl";

@injectable()
export default class MemberCardXrefDAOImpl extends AbstractDAOImpl<MemberCardXref> implements MemberCardXrefDAO {

    constructor() {
        super(TableName.MemberCardXref);
    }

    getCardByMemberId(memberId: number): Promise<CardCode> {
        return this.find("memberId", memberId)
            .then(xref => xref?.cardCode || null);
    }

    getCardsByMemberIds(memberIds: number[]): Promise<MemberCardXref[]> {
        return Promise.all(memberIds.map(mId => this.find("memberId", mId)))
            .then(xrefs => xrefs.filter(xref => !!xref));
    }

    put(memberId: number, cardCode: CardCode): Promise<MemberCardXref> {
        return this.save({ memberId, cardCode });
    }

    removeByMemberId(memberId: number): Promise<void> {
        return this.delete("memberId", memberId);
    }

    removeByMemberIds(memberIds: number[]): Promise<void> {
        return Promise.all(memberIds.map(memberId => this.removeByMemberId(memberId)))
            .then();
    }

}