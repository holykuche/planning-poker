import "reflect-metadata";
import { Member } from "data/common-data/entity";
import MemberDAOImpl from "data/common-data/in-memory-impl/MemberDAOImpl";

describe("data/common-data/in-memory-impl/MemberDAOImpl", () => {

    let memberDAO: MemberDAOImpl;

    beforeEach(() => {
        memberDAO = new MemberDAOImpl();
    });

    it("save should return a new object", () => {
        const storedMember1 = memberDAO.save({ name: "dummy name" });
        const storedMember2 = memberDAO.save(storedMember1);

        expect(storedMember2).not.toBe(storedMember1);
    });

    it("save should assign ID to member without ID", () => {
        const storedMember = memberDAO.save({ name: "dummy name" });

        expect(storedMember.id).toBeDefined();
    });

    it("save should return member with the same property values", () => {
        const member = { name: "dummy name" };
        const storedMember = memberDAO.save(member);

        expect(storedMember.name).toBe(member.name);
    });

    it("getById should return stored member", () => {
        const members = [
            { name: "dummy name 1" },
            { name: "dummy name 2" },
            { name: "dummy name 3" },
            { name: "dummy name 4" },
            { name: "dummy name 5" },
        ];

        members
            .map(member => memberDAO.save(member))
            .map(storedMember => [ storedMember, memberDAO.getById(storedMember.id) ])
            .forEach(([ storedMember, receivedMember ]) => expect(receivedMember).toEqual(storedMember));
    });

    it("getById should return a new object", () => {
        const storedMember = memberDAO.save({ name: "dummy name" });
        const receivedMember = memberDAO.getById(storedMember.id);

        expect(receivedMember).not.toBe(storedMember);
    });

    it("getById shouldn't return not stored member", () => {
        const receivedMember = memberDAO.getById(1);

        expect(receivedMember).toBeNull();
    });

    it("getByIds should return stored members", () => {
        const members = [
            { name: "dummy name 1" },
            { name: "dummy name 2" },
            { name: "dummy name 3" },
            { name: "dummy name 4" },
            { name: "dummy name 5" },
        ];

        const storedMembers: [ number, Member ][] = members
            .map(member => memberDAO.save(member))
            .reduce((memberTuples, storedMember) => [
                ...memberTuples,
                [ storedMember.id, storedMember ],
            ], []);
        memberDAO.getByIds(storedMembers.map(([ id ]) => id))
            .forEach(receivedMember => {
                const storedMember = storedMembers
                    .map(([ , sm ]) => sm)
                    .find(sm => sm.id === receivedMember.id);
                expect(receivedMember).toEqual(storedMember);
            });
    });

    it("getByIds should return empty array for not existed IDs", () => {
        const notExistedMemberIds = [ 1, 2, 3, 4, 5 ];

        expect(memberDAO.getByIds(notExistedMemberIds).length).toBe(0);
    });

    it("getByName should return stored member", () => {
        const members = [
            { name: "dummy name 1" },
            { name: "dummy name 2" },
            { name: "dummy name 3" },
            { name: "dummy name 4" },
            { name: "dummy name 5" },
        ];

        members
            .map(member => memberDAO.save(member))
            .map(storedMember => [ storedMember, memberDAO.getByName(storedMember.name) ])
            .forEach(([ storedMember, receivedMember ]) => expect(receivedMember).toEqual(storedMember));
    });

    it("getByName shouldn't return not stored member", () => {
        const receivedMember = memberDAO.getByName("dummy name");

        expect(receivedMember).toBeNull();
    });

    it("getByName should return a new object", () => {
        const storedMember = memberDAO.save({ name: "dummy name" });
        const receivedMember = memberDAO.getByName(storedMember.name);

        expect(receivedMember).not.toBe(storedMember);
    });

    it("deleteById should delete stored member", () => {
        const storedMember = memberDAO.save({ name: "dummy name" });
        memberDAO.deleteById(storedMember.id);
        const receivedMember = memberDAO.getById(storedMember.id);

        expect(receivedMember).toBeNull();
    });

    it("deleteByIds should delete stored members", () => {
        const members = [
            { name: "dummy name 1" },
            { name: "dummy name 2" },
            { name: "dummy name 3" },
            { name: "dummy name 4" },
            { name: "dummy name 5" },
        ];

        const storedMemberIds = members
            .map(member => memberDAO.save(member))
            .map(storedMember => storedMember.id);
        memberDAO.deleteByIds(storedMemberIds);

        expect(memberDAO.getByIds(storedMemberIds).length).toBe(0);
    });
});