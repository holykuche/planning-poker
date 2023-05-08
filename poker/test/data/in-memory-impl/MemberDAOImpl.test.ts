import "reflect-metadata";
import { CalledWithMock, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "config/inversify";
import { MemberDAO, DAO_TYPES } from "data/api";
import { Member } from "data/entity";
import { TableName } from "data/enum";
import { DatabaseClient, DB_CLIENT_TYPES } from "db-client/api";

import { sameObject } from "../../test-utils/customMatchers";

import MemberDAOImpl from "data/impl/MemberDAOImpl";

describe("data/impl/MemberDAOImpl", () => {

    let memberDAO: MemberDAO;

    let dbClient: MockProxy<DatabaseClient>;

    beforeAll(() => {
        container.bind<MemberDAO>(DAO_TYPES.MemberDAO).to(MemberDAOImpl);

        dbClient = mock<DatabaseClient>();
        container.bind<DatabaseClient>(DB_CLIENT_TYPES.DatabaseClient).toConstantValue(dbClient);

        memberDAO = container.get<MemberDAO>(DAO_TYPES.MemberDAO);
    });

    beforeEach(() => {
        mockReset(dbClient);
    });

    it("save should send save query to db", () => {
        const member: Member = { name: "dummy name" };
        const storedMember: Member = { id: 1, ...member };

        dbClient.save
            .calledWith(TableName.Member, sameObject(member))
            .mockReturnValue(Promise.resolve(storedMember));

        memberDAO.save(member)
            .then(returnedMember => {
                expect(dbClient.save).toBeCalledWith(TableName.Member, member);
                expect(returnedMember).toEqual(storedMember);
            });
    });

    it("getById should send find query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClient.find as CalledWithMock<Promise<Member>, [ TableName, string, number ]>)
            .calledWith(TableName.Member, "id", member.id)
            .mockReturnValue(Promise.resolve(member));

        memberDAO.getById(member.id)
            .then(returnedMember => {
                expect(dbClient.find).toBeCalledWith(TableName.Member, "id", member.id);
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
                (dbClient.find as CalledWithMock<Promise<Member>, [ TableName, string, number ]>)
                    .calledWith(TableName.Member, "id", member.id)
                    .mockReturnValue(Promise.resolve(member));
            });

        memberDAO.getByIds(members.map(m => m.id))
            .then(returnedMembers => {
                members
                    .forEach((member, idx) => {
                        expect(dbClient.find).toBeCalledWith(TableName.Member, "id", member.id);
                        expect(returnedMembers[ idx ]).toEqual(member);
                    });
            });
    });

    it("getByName should send find query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClient.find as CalledWithMock<Promise<Member>, [ TableName, string, string ]>)
            .calledWith(TableName.Member, "name", member.name)
            .mockReturnValue(Promise.resolve(member));

        memberDAO.getByName(member.name)
            .then(returnedMember => {
                expect(dbClient.find).toBeCalledWith(TableName.Member, "name", member.name);
                expect(returnedMember).toEqual(member);
            });
    });

    it("deleteById should send delete query to db", () => {
        const member: Member = { id: 1, name: "dummy name" };

        (dbClient.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.Member, "id", member.id)
            .mockReturnValue(Promise.resolve());

        memberDAO.deleteById(member.id)
            .then(() => {
                expect(dbClient.delete).toBeCalledWith(TableName.Member, "id", member.id);
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
                (dbClient.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
                    .calledWith(TableName.Member, "id", member.id)
                    .mockReturnValue(Promise.resolve());
            });

        memberDAO.deleteByIds(members.map(m => m.id))
            .then(() => {
                members
                    .forEach((member) => {
                        expect(dbClient.delete).toBeCalledWith(TableName.Member, "id", member.id);
                    });
            });
    });
});