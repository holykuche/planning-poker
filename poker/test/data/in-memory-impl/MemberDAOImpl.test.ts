import "reflect-metadata";
import { CalledWithMock, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "config/inversify";
import { MemberDAO, DAO_TYPES } from "data/api";
import { Member } from "data/entity";
import { TableName } from "data/enum";
import { DatabaseClient, GRPC_CLIENT_TYPES } from "grpc-client/api";

import { sameObject } from "../../test-utils/customMatchers";

import MemberDAOImpl from "data/impl/MemberDAOImpl";

describe("data/impl/MemberDAOImpl", () => {

    let memberDAO: MemberDAO;

    let dbClientMock: MockProxy<DatabaseClient>;

    beforeAll(() => {
        container.bind<MemberDAO>(DAO_TYPES.MemberDAO).to(MemberDAOImpl);

        dbClientMock = mock<DatabaseClient>();
        container.bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient).toConstantValue(dbClientMock);

        memberDAO = container.get<MemberDAO>(DAO_TYPES.MemberDAO);
    });

    beforeEach(() => {
        mockReset(dbClientMock);
    });

    it("save should send save query to db", () => {
        const member: Member = { name: "dummy name" };
        const storedMember: Member = { id: 1, ...member };

        dbClientMock.save
            .calledWith(TableName.Member, sameObject(member))
            .mockReturnValue(Promise.resolve(storedMember));

        return memberDAO.save(member)
            .then(returnedMember => {
                expect(dbClientMock.save).toBeCalledWith(TableName.Member, member);
                expect(returnedMember).toEqual(storedMember);
            });
    });

    it("getById should send find query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClientMock.find as CalledWithMock<Promise<Member>, [ TableName, string, number ]>)
            .calledWith(TableName.Member, "id", member.id)
            .mockReturnValue(Promise.resolve(member));

        return memberDAO.getById(member.id)
            .then(returnedMember => {
                expect(dbClientMock.find).toBeCalledWith(TableName.Member, "id", member.id);
                expect(returnedMember).toEqual(member);
            })
    });

    // todo: it needs to make DatabaseClient able to send bulk find queries
    it("getByIds should send find query to db many times", () => {
        const members: Member[] = [
            { id: 1, name: "dummy name 1" },
            { id: 2, name: "dummy name 2" },
            { id: 3, name: "dummy name 3" },
            { id: 4, name: "dummy name 4" },
            { id: 5, name: "dummy name 5" },
        ];

        members
            .forEach(member => {
                (dbClientMock.find as CalledWithMock<Promise<Member>, [ TableName, string, number ]>)
                    .calledWith(TableName.Member, "id", member.id)
                    .mockReturnValue(Promise.resolve(member));
            });

        return memberDAO.getByIds(members.map(m => m.id))
            .then(returnedMembers => {
                members
                    .forEach((member, idx) => {
                        expect(dbClientMock.find).toBeCalledWith(TableName.Member, "id", member.id);
                        expect(returnedMembers[ idx ]).toEqual(member);
                    });
            });
    });

    it("getByName should send find query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClientMock.find as CalledWithMock<Promise<Member>, [ TableName, string, string ]>)
            .calledWith(TableName.Member, "name", member.name)
            .mockReturnValue(Promise.resolve(member));

        return memberDAO.getByName(member.name)
            .then(returnedMember => {
                expect(dbClientMock.find).toBeCalledWith(TableName.Member, "name", member.name);
                expect(returnedMember).toEqual(member);
            });
    });

    it("deleteById should send delete query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.Member, "id", member.id)
            .mockReturnValue(Promise.resolve());

        return memberDAO.deleteById(member.id)
            .then(() => {
                expect(dbClientMock.delete).toBeCalledWith(TableName.Member, "id", member.id);
            });
    });

    // todo: it needs to make DatabaseClient able to send bulk delete queries
    it("deleteByIds should send delete query to db many times", () => {
        const members: Member[] = [
            { id: 1, name: "dummy name 1" },
            { id: 2, name: "dummy name 2" },
            { id: 3, name: "dummy name 3" },
            { id: 4, name: "dummy name 4" },
            { id: 5, name: "dummy name 5" },
        ];

        members
            .forEach(member => {
                (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
                    .calledWith(TableName.Member, "id", member.id)
                    .mockReturnValue(Promise.resolve());
            });

        return memberDAO.deleteByIds(members.map(m => m.id))
            .then(() => {
                members
                    .forEach((member) => {
                        expect(dbClientMock.delete).toBeCalledWith(TableName.Member, "id", member.id);
                    });
            });
    });
});