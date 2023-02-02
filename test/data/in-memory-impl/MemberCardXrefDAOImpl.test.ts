import "reflect-metadata";

import { MemberCardXref } from "data/entity";
import { CardCode } from "data/enum";

import MemberCardXrefDAOImpl from "data/in-memory-impl/MemberCardXrefDAOImpl";

describe("data/in-memory-impl/MemberCardXrefDAOImpl", () => {

    let memberCardXrefDAO: MemberCardXrefDAOImpl;

    beforeEach(() => {
        memberCardXrefDAO = new MemberCardXrefDAOImpl();
    });

    it("put should save member-card xref", () => {
        const xref: MemberCardXref = { memberId: 1, cardCode: CardCode.DontKnow };

        expect(memberCardXrefDAO.getCardByMemberId(xref.memberId)).toBeNull();
        memberCardXrefDAO.put(xref.memberId, xref.cardCode);
        expect(memberCardXrefDAO.getCardByMemberId(xref.memberId)).toBe(xref.cardCode);
    });

    it("getCardByMemberId should return member's card", () => {
        const xrefs: MemberCardXref[] = [
            { memberId: 1, cardCode: CardCode.DontKnow },
            { memberId: 2, cardCode: CardCode.Skip },
            { memberId: 3, cardCode: CardCode.Score100 },
            { memberId: 4, cardCode: CardCode.Score40 },
            { memberId: 5, cardCode: CardCode.Score0 },
        ];

        xrefs.forEach(xref => memberCardXrefDAO.put(xref.memberId, xref.cardCode));

        xrefs
            .map(xref => [ xref, memberCardXrefDAO.getCardByMemberId(xref.memberId) ] as const)
            .forEach(([ xref, receivedCard ]) => expect(receivedCard).toBe(xref.cardCode));
    });

    it("getCardByMemberId shouldn't return not stored card", () => {
        const notStoredCard = memberCardXrefDAO.getCardByMemberId(1);
        expect(notStoredCard).toBeNull();
    });

    it("getCardsByMemberIds should return member's cards", () => {
        const xrefs: MemberCardXref[] = [
            { memberId: 1, cardCode: CardCode.DontKnow },
            { memberId: 2, cardCode: CardCode.Skip },
            { memberId: 3, cardCode: CardCode.Score100 },
            { memberId: 4, cardCode: CardCode.Score40 },
            { memberId: 5, cardCode: CardCode.Score0 },
        ];
        const memberIds = xrefs.map(xref => xref.memberId);

        xrefs.forEach(xref => memberCardXrefDAO.put(xref.memberId, xref.cardCode));

        const receivedXrefs = memberCardXrefDAO.getCardsByMemberIds(memberIds);

        expect(receivedXrefs.length).toBe(xrefs.length);

        const xrefsComparator = (left: MemberCardXref, right: MemberCardXref) => left.cardCode.localeCompare(right.cardCode);
        const sortedReceivedXrefs = receivedXrefs.sort(xrefsComparator);
        const sortedXrefs = xrefs.sort(xrefsComparator);
        sortedReceivedXrefs.forEach((xref, i) => expect(xref).toEqual(sortedXrefs[ i ]));
    });

    it("getCardsByMemberIds shouldn't return not stored member's cards", () => {
        const memberIds = [ 1, 2, 3, 4, 5, 6 ];
        const receivedXrefs = memberCardXrefDAO.getCardsByMemberIds(memberIds);

        expect(receivedXrefs.length).toBe(0);
    });

    it("removeByMemberId should delete stored member-card xref", () => {
        const xref: MemberCardXref = { memberId: 1, cardCode: CardCode.DontKnow };

        memberCardXrefDAO.put(xref.memberId, xref.cardCode);
        expect(memberCardXrefDAO.getCardByMemberId(xref.memberId)).toBe(xref.cardCode);

        memberCardXrefDAO.removeByMemberId(xref.memberId);
        expect(memberCardXrefDAO.getCardByMemberId(xref.memberId)).toBeNull();
    });

    it("removeByMemberIds should delete stored member-card xrefs", () => {
        const xrefs: MemberCardXref[] = [
            { memberId: 1, cardCode: CardCode.DontKnow },
            { memberId: 2, cardCode: CardCode.Skip },
            { memberId: 3, cardCode: CardCode.Score100 },
            { memberId: 4, cardCode: CardCode.Score40 },
            { memberId: 5, cardCode: CardCode.Score0 },
        ];
        const memberIds = xrefs.map(xref => xref.memberId);

        xrefs.forEach(xref => memberCardXrefDAO.put(xref.memberId, xref.cardCode));
        expect(memberCardXrefDAO.getCardsByMemberIds(memberIds).length).toBe(xrefs.length);

        memberCardXrefDAO.removeByMemberIds(memberIds);
        expect(memberCardXrefDAO.getCardsByMemberIds(memberIds).length).toBe(0);
    });
});
