import "reflect-metadata";
import { CalledWithMock, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "config/inversify";
import { MemberCardXref } from "data/entity";
import { CardCode, TableName } from "data/enum";
import { MemberCardXrefDAO, DAO_TYPES } from "data/api";
import { DatabaseClient, DB_CLIENT_TYPES } from "db-client/api";

import { sameObject } from "../../test-utils/customMatchers";

import MemberCardXrefDAOImpl from "data/impl/MemberCardXrefDAOImpl";

describe("data/common-data/in-memory-impl/MemberCardXrefDAOImpl", () => {

    let memberCardXrefDAO: MemberCardXrefDAO;

    let dbClientMock: MockProxy<DatabaseClient>;

    beforeAll(() => {
        container.bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO).to(MemberCardXrefDAOImpl);

        dbClientMock = mock<DatabaseClient>();
        container.bind<DatabaseClient>(DB_CLIENT_TYPES.DatabaseClient).toConstantValue(dbClientMock);

        memberCardXrefDAO = container.get<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO);
    });

    beforeEach(() => {
        mockReset(dbClientMock);
    });

    it("put should send save query to db", () => {
        const xref: MemberCardXref = { memberId: 1, cardCode: CardCode.DontKnow };

        dbClientMock.save
            .calledWith(TableName.MemberCardXref, sameObject(xref))
            .mockReturnValue(Promise.resolve(xref));

        memberCardXrefDAO.put(xref.memberId, xref.cardCode)
            .then(() => {
                expect(dbClientMock.save)
                    .toBeCalledWith(TableName.MemberCardXref, xref);
            });
    });

    it("getCardByMemberId should send find query to db", () => {
        const xref: MemberCardXref = { memberId: 1, cardCode: CardCode.DontKnow };

        (dbClientMock.find as CalledWithMock<Promise<MemberCardXref>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberCardXref, "memberId", xref.memberId)
            .mockReturnValue(Promise.resolve(xref));

        memberCardXrefDAO.getCardByMemberId(xref.memberId)
            .then(card => {
                expect(dbClientMock.find)
                    .toBeCalledWith(TableName.MemberCardXref, "memberId", xref.memberId);
                expect(card).toBe(xref.cardCode);
            });
    });

    // todo: it needs to make DatabaseClient able to send bulk find queries
    it("getCardsByMemberIds should send find query to db many times", () => {
        const xrefs: MemberCardXref[] = [
            { memberId: 1, cardCode: CardCode.DontKnow },
            { memberId: 2, cardCode: CardCode.Skip },
            { memberId: 3, cardCode: CardCode.Score100 },
            { memberId: 4, cardCode: CardCode.Score40 },
            { memberId: 5, cardCode: CardCode.Score0 },
        ];
        const memberIds = xrefs.map(xref => xref.memberId);

        xrefs
            .forEach(xref => {
                (dbClientMock.find as CalledWithMock<Promise<MemberCardXref>, [ TableName, string, number ]>)
                    .calledWith(TableName.MemberCardXref, "memberId", xref.memberId)
                    .mockReturnValue(Promise.resolve(xref));
            });

        memberCardXrefDAO.getCardsByMemberIds(memberIds)
            .then(receivedXrefs => {
                receivedXrefs
                    .forEach(xref => {
                        expect(dbClientMock.find)
                            .toBeCalledWith(TableName.MemberCardXref, "memberId", xref.memberId);
                    });
                expect(receivedXrefs).toEqual(xrefs);
            });
    });

    it("removeByMemberId should send delete query to db", () => {
        const xref: MemberCardXref = { memberId: 1, cardCode: CardCode.DontKnow };

        (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberCardXref, "memberId", xref.memberId)
            .mockReturnValue(Promise.resolve());

        memberCardXrefDAO.removeByMemberId(xref.memberId)
            .then(() => {
                expect(dbClientMock.delete)
                    .toBeCalledWith(TableName.MemberCardXref, "memberId", xref.memberId);
            });
    });

    // todo: it needs to make DatabaseClient able to send bulk delete queries
    it("removeByMemberIds should send delete query to db many times", () => {
        const xrefs: MemberCardXref[] = [
            { memberId: 1, cardCode: CardCode.DontKnow },
            { memberId: 2, cardCode: CardCode.Skip },
            { memberId: 3, cardCode: CardCode.Score100 },
            { memberId: 4, cardCode: CardCode.Score40 },
            { memberId: 5, cardCode: CardCode.Score0 },
        ];
        const memberIds = xrefs.map(xref => xref.memberId);

        xrefs
            .forEach(xref => {
                (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
                    .calledWith(TableName.MemberCardXref, "memberId", xref.memberId)
                    .mockReturnValue(Promise.resolve());
            });

        memberCardXrefDAO.removeByMemberIds(memberIds)
            .then(() => {
                xrefs
                    .forEach(xref => {
                        expect(dbClientMock.delete)
                            .toBeCalledWith(TableName.MemberCardXref, "memberId", xref.memberId);
                    });
            });
    });
});
