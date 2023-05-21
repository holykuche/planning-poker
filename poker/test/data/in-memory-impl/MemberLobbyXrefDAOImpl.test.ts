import "reflect-metadata";
import { CalledWithMock, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "config/inversify";
import { DAO_TYPES, MemberLobbyXrefDAO } from "data/api";
import { MemberLobbyXref } from "data/entity";
import { TableName } from "data/enum";
import { DatabaseClient, GRPC_CLIENT_TYPES } from "grpc-client/api";

import { sameObject } from "../../test-utils/customMatchers";

import MemberLobbyXrefDAOImpl from "data/impl/MemberLobbyXrefDAOImpl";

describe("data/impl/MemberLobbyXrefDAOImpl", () => {

    let memberLobbyXrefDAO: MemberLobbyXrefDAO;

    let dbClientMock: MockProxy<DatabaseClient>;

    beforeAll(() => {
        container.bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO).to(MemberLobbyXrefDAOImpl);

        dbClientMock = mock<DatabaseClient>();
        container.bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient).toConstantValue(dbClientMock);

        memberLobbyXrefDAO = container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO);
    });

    beforeEach(() => {
        mockReset(dbClientMock);
    });

    it("bindMember should send save query to db", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        dbClientMock.save
            .calledWith(TableName.MemberLobbyXref, sameObject(xref))
            .mockReturnValue(Promise.resolve(xref));

        return memberLobbyXrefDAO.bindMember(xref.memberId, xref.lobbyId)
            .then(() => {
                expect(dbClientMock.save).toBeCalledWith(TableName.MemberLobbyXref, xref);
            });
    });

    it("getMembersBinding should send find query to db", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        (dbClientMock.find as CalledWithMock<Promise<MemberLobbyXref>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberLobbyXref, "memberId", xref.memberId)
            .mockReturnValue(Promise.resolve(xref));

        return memberLobbyXrefDAO.getMembersBinding(xref.memberId)
            .then(lobbyId => {
                expect(dbClientMock.find).toBeCalledWith(TableName.MemberLobbyXref, "memberId", xref.memberId);
                expect(lobbyId).toBe(xref.lobbyId);
            });
    });

    it("getMemberIdsByLobbyId should send findMany query to db", () => {
        const xrefs: MemberLobbyXref[] = [
            { memberId: 1, lobbyId: 10 },
            { memberId: 2, lobbyId: 10 },
            { memberId: 3, lobbyId: 10 },
            { memberId: 4, lobbyId: 10 },
            { memberId: 5, lobbyId: 10 },
        ];

        (dbClientMock.findMany as CalledWithMock<Promise<MemberLobbyXref[]>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberLobbyXref, "lobbyId", xrefs[ 0 ].lobbyId)
            .mockReturnValue(Promise.resolve(xrefs));

        return memberLobbyXrefDAO.getMemberIdsByLobbyId(xrefs[ 0 ].lobbyId)
            .then(returnedMemberIds => {
                expect(dbClientMock.findMany).toBeCalledWith(TableName.MemberLobbyXref, "lobbyId", xrefs[ 0 ].lobbyId);
                expect(returnedMemberIds).toEqual(xrefs.map(xref => xref.memberId));
            });
    });

    it("unbindMember should send delete query to db", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberLobbyXref, "memberId", xref.memberId)
            .mockReturnValue(Promise.resolve());

        return memberLobbyXrefDAO.unbindMember(xref.memberId)
            .then(() => {
                expect(dbClientMock.delete).toBeCalledWith(TableName.MemberLobbyXref, "memberId", xref.memberId);
            });
    });

    it("unbindMembers should send delete query to db", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberLobbyXref, "lobbyId", xref.lobbyId)
            .mockReturnValue(Promise.resolve());

        return memberLobbyXrefDAO.unbindMembers(xref.lobbyId)
            .then(() => {
                expect(dbClientMock.delete).toBeCalledWith(TableName.MemberLobbyXref, "lobbyId", xref.lobbyId);
            });
    });

    it("isMemberBound should send find query to db", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        (dbClientMock.find as CalledWithMock<Promise<MemberLobbyXref>, [ TableName, string, number ]>)
            .calledWith(TableName.MemberLobbyXref, "memberId", xref.memberId)
            .mockReturnValue(Promise.resolve(xref));

        return memberLobbyXrefDAO.isMemberBound(xref.memberId)
            .then(isBound => {
                expect(dbClientMock.find).toBeCalledWith(TableName.MemberLobbyXref, "memberId", xref.memberId);
                expect(isBound).toBe(true);
            });
    });
});
