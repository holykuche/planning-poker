import "reflect-metadata";
import { MemberLobbyXref } from "data/entity";
import MemberLobbyXrefDAOImpl from "data/in-memory-impl/MemberLobbyXrefDAOImpl";

describe("data/in-memory-impl/MemberLobbyXrefDAOImpl", () => {

    let memberLobbyXrefDAOImpl: MemberLobbyXrefDAOImpl;

    beforeEach(() => {
        memberLobbyXrefDAOImpl = new MemberLobbyXrefDAOImpl();
    });

    it("bindMember should save member-lobby xref", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        expect(memberLobbyXrefDAOImpl.getMembersBinding(xref.memberId)).toBeNull();
        memberLobbyXrefDAOImpl.bindMember(xref.memberId, xref.lobbyId);
        expect(memberLobbyXrefDAOImpl.getMembersBinding(xref.memberId)).toBe(xref.lobbyId);
    });

    it("getMembersBinding should return member's lobby ID", () => {
        const xrefs: MemberLobbyXref[] = [
            { memberId: 1, lobbyId: 10 },
            { memberId: 2, lobbyId: 20 },
            { memberId: 3, lobbyId: 30 },
            { memberId: 4, lobbyId: 40 },
            { memberId: 5, lobbyId: 50 },
        ];

        xrefs.forEach(xref => memberLobbyXrefDAOImpl.bindMember(xref.memberId, xref.lobbyId));

        xrefs
            .map(xref => [ xref, memberLobbyXrefDAOImpl.getMembersBinding(xref.memberId) ] as const)
            .forEach(([ xref, receivedLobbyId ]) => expect(receivedLobbyId).toBe(xref.lobbyId));
    });

    it("getMembersBinding shouldn't return lobby ID for not included to any lobby member", () => {
        const notStoredLobbyId = memberLobbyXrefDAOImpl.getMembersBinding(1);
        expect(notStoredLobbyId).toBeNull();
    });

    it("getMemberIdsByLobbyId should return member ID's included into lobby", () => {
        const lobbyId = 10;
        const memberIds = [ 1, 2, 3, 4, 5 ];

        memberIds.forEach(memberId => memberLobbyXrefDAOImpl.bindMember(memberId, lobbyId));

        const receivedMemberIds = memberLobbyXrefDAOImpl.getMemberIdsByLobbyId(lobbyId);
        expect(receivedMemberIds.length).toBe(memberIds.length);

        const sortedMemberIds = memberIds.sort();
        const sortedReceivedMemberIds = receivedMemberIds.sort();
        sortedReceivedMemberIds.forEach((memberId, i) => expect(memberId).toBe(sortedMemberIds[ i ]));
    });

    it("unbindMember should delete stored member-lobby xref", () => {
        const xref: MemberLobbyXref = { memberId: 1, lobbyId: 10 };

        memberLobbyXrefDAOImpl.bindMember(xref.memberId, xref.lobbyId);
        expect(memberLobbyXrefDAOImpl.getMembersBinding(xref.memberId)).toBe(xref.lobbyId);

        memberLobbyXrefDAOImpl.unbindMember(xref.memberId);
        expect(memberLobbyXrefDAOImpl.getMembersBinding(xref.memberId)).toBeNull();
    });

    it("unbindMembers should delete stored member-lobby xrefs", () => {
        const lobbyId = 10;
        const memberIds = [ 1, 2, 3, 4, 5 ];

        memberIds.forEach(memberId => memberLobbyXrefDAOImpl.bindMember(memberId, lobbyId));

        const receivedMemberIds = memberLobbyXrefDAOImpl.getMemberIdsByLobbyId(lobbyId);
        expect(receivedMemberIds.length).toBe(memberIds.length);

        memberLobbyXrefDAOImpl.unbindMembers(lobbyId);
        expect(memberLobbyXrefDAOImpl.getMemberIdsByLobbyId(lobbyId).length).toBe(0);
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
            .map(xref => memberLobbyXrefDAOImpl.isMemberBound(xref.memberId))
            .forEach(isMemberBound => expect(isMemberBound).toBeFalsy());

        xrefs.forEach(xref => memberLobbyXrefDAOImpl.bindMember(xref.memberId, xref.lobbyId));

        xrefs
            .map(xref => memberLobbyXrefDAOImpl.isMemberBound(xref.memberId))
            .forEach(isMemberBound => expect(isMemberBound).toBeTruthy());
    });
});
