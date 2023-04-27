import "reflect-metadata";
import { MemberLobbyXref } from "data/entity";
import MemberLobbyXrefDAOImpl from "data/impl/MemberLobbyXrefDAOImpl";

describe("data/common-data/in-memory-impl/MemberLobbyXrefDAOImpl", () => {

    let memberLobbyXrefDAO: MemberLobbyXrefDAOImpl;

    beforeEach(() => {
        memberLobbyXrefDAO = new MemberLobbyXrefDAOImpl();
    });

    it("bindMember should save member-lobby xref", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        expect(memberLobbyXrefDAO.getMembersBinding(xref.memberId)).toBeNull();
        memberLobbyXrefDAO.bindMember(xref.memberId, xref.lobbyId);
        expect(memberLobbyXrefDAO.getMembersBinding(xref.memberId)).toBe(xref.lobbyId);
    });

    it("getMembersBinding should return member's lobby ID", () => {
        const xrefs: MemberLobbyXref[] = [
            { memberId: 1, lobbyId: 10 },
            { memberId: 2, lobbyId: 20 },
            { memberId: 3, lobbyId: 30 },
            { memberId: 4, lobbyId: 40 },
            { memberId: 5, lobbyId: 50 },
        ];

        xrefs.forEach(xref => memberLobbyXrefDAO.bindMember(xref.memberId, xref.lobbyId));

        xrefs
            .map(xref => [ xref, memberLobbyXrefDAO.getMembersBinding(xref.memberId) ] as const)
            .forEach(([ xref, receivedLobbyId ]) => expect(receivedLobbyId).toBe(xref.lobbyId));
    });

    it("getMembersBinding shouldn't return lobby ID for not included to any lobby member", () => {
        const notStoredLobbyId = memberLobbyXrefDAO.getMembersBinding(1);
        expect(notStoredLobbyId).toBeNull();
    });

    it("getMemberIdsByLobbyId should return member ID's included into lobby", () => {
        const lobbyId = 10;
        const memberIds = [ 1, 2, 3, 4, 5 ];

        memberIds.forEach(memberId => memberLobbyXrefDAO.bindMember(memberId, lobbyId));

        const receivedMemberIds = memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        expect(receivedMemberIds.length).toBe(memberIds.length);

        const sortedMemberIds = memberIds.sort();
        const sortedReceivedMemberIds = receivedMemberIds.sort();
        sortedReceivedMemberIds.forEach((memberId, i) => expect(memberId).toBe(sortedMemberIds[ i ]));
    });

    it("unbindMember should delete stored member-lobby xref", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        memberLobbyXrefDAO.bindMember(xref.memberId, xref.lobbyId);
        expect(memberLobbyXrefDAO.getMembersBinding(xref.memberId)).toBe(xref.lobbyId);

        memberLobbyXrefDAO.unbindMember(xref.memberId);
        expect(memberLobbyXrefDAO.getMembersBinding(xref.memberId)).toBeNull();
    });

    it("unbindMembers should delete stored member-lobby xrefs", () => {
        const lobbyId = 10;
        const memberIds = [ 1, 2, 3, 4, 5 ];

        memberIds.forEach(memberId => memberLobbyXrefDAO.bindMember(memberId, lobbyId));

        const receivedMemberIds = memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        expect(receivedMemberIds.length).toBe(memberIds.length);

        memberLobbyXrefDAO.unbindMembers(lobbyId);
        expect(memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId).length).toBe(0);
    });

    it("isMemberBound should return true for members included into lobby", () => {
        const xrefs: MemberLobbyXref[] = [
            { memberId: 1, lobbyId: 10 },
            { memberId: 2, lobbyId: 20 },
            { memberId: 3, lobbyId: 30 },
            { memberId: 4, lobbyId: 40 },
            { memberId: 5, lobbyId: 50 },
        ];

        xrefs
            .map(xref => memberLobbyXrefDAO.isMemberBound(xref.memberId))
            .forEach(isMemberBound => expect(isMemberBound).toBeFalsy());

        xrefs.forEach(xref => memberLobbyXrefDAO.bindMember(xref.memberId, xref.lobbyId));

        xrefs
            .map(xref => memberLobbyXrefDAO.isMemberBound(xref.memberId))
            .forEach(isMemberBound => expect(isMemberBound).toBeTruthy());
    });
});
