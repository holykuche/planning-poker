import "reflect-metadata";
import { Container, BindingScopeEnum } from "inversify";
import { mock, mockReset, anyNumber, MockProxy } from "jest-mock-extended";

import { MemberDAO, MemberCardXrefDAO, MemberLobbyXrefDAO, LobbyDAO, DAO_TYPES } from "data/api";
import { CardCode, LobbyState } from "data/enum";
import { MemberService, SubscriptionService, LobbyService, SERVICE_TYPES } from "service/api";
import { MemberIsNotInLobbyError, PokerIsNotStartedError, UnknownMemberError } from "service/error";

import MemberServiceImpl from "service/impl/MemberServiceImpl";

describe("MemberServiceImpl", () => {

    let memberService: MemberService;

    let memberDAOMock: MockProxy<MemberDAO>;
    let memberCardXrefDAOMock: MockProxy<MemberCardXrefDAO>;
    let memberLobbyXrefDAOMock: MockProxy<MemberLobbyXrefDAO>;
    let lobbyDAOMock: MockProxy<LobbyDAO>;
    let subscriptionServiceMock: MockProxy<SubscriptionService>;
    let lobbyServiceMock: MockProxy<LobbyService>;

    beforeAll(() => {
        const container = new Container({ defaultScope: BindingScopeEnum.Singleton });
        container.bind<MemberService>(SERVICE_TYPES.MemberService).to(MemberServiceImpl);

        memberDAOMock = mock<MemberDAO>();
        container.bind<MemberDAO>(DAO_TYPES.MemberDAO).toConstantValue(memberDAOMock);

        memberCardXrefDAOMock = mock<MemberCardXrefDAO>();
        container.bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO).toConstantValue(memberCardXrefDAOMock);

        memberLobbyXrefDAOMock = mock<MemberLobbyXrefDAO>();
        container.bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO).toConstantValue(memberLobbyXrefDAOMock);

        lobbyDAOMock = mock<LobbyDAO>();
        container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).toConstantValue(lobbyDAOMock);

        subscriptionServiceMock = mock<SubscriptionService>();
        container.bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService).toConstantValue(subscriptionServiceMock);

        lobbyServiceMock = mock<LobbyService>();
        container.bind<LobbyService>(SERVICE_TYPES.LobbyService).toConstantValue(lobbyServiceMock);

        memberService = container.get<MemberService>(SERVICE_TYPES.MemberService);
    });

    beforeEach(() => {
        mockReset(memberDAOMock);
        mockReset(memberCardXrefDAOMock);
        mockReset(memberLobbyXrefDAOMock);
        mockReset(lobbyDAOMock);
        mockReset(subscriptionServiceMock);
        mockReset(lobbyServiceMock);
    });

    it("getById should return a member if it was called with that member's ID", () => {
        const dummyMember = { id: 1, name: "dummy" };
        memberDAOMock.getById.calledWith(dummyMember.id).mockReturnValue(dummyMember);

        expect(memberService.getById(dummyMember.id)).toBe(dummyMember);
    });

    it("getById should throw an error if it was called with ID of not existed member", () => {
        memberDAOMock.getById.calledWith(anyNumber()).mockReturnValue(null);

        expect(() => memberService.getById(1)).toThrowError(UnknownMemberError);
    });

    it("getMembersLobbyId should return a lobby ID if it was called with member's ID who id involved into a lobby", () => {
        const memberId = 1;
        const membersLobbyId = 2;
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(membersLobbyId);

        expect(memberService.getMembersLobbyId(memberId)).toBe(membersLobbyId);
    });

    it("getMembersLobbyId should throw an error if it was called with member's ID who isn't involved into any lobby", () => {
        memberDAOMock.getById.calledWith(anyNumber()).mockReturnValue({ id: 1, name: "dummy" });
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(anyNumber()).mockReturnValue(null);

        expect(() => memberService.getMembersLobbyId(1)).toThrowError(MemberIsNotInLobbyError);
    });

    it("isMemberInLobby should return true if it was called with member's ID who is involved into a lobby", () => {
        const memberId = 1;
        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(true);

        expect(memberService.isMemberInLobby(memberId)).toBe(true);
    });

    it("isMemberInLobby should return false if it was called with member's ID who isn't involved into any lobby", () => {
        const memberId = 1;
        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);

        expect(memberService.isMemberInLobby(memberId)).toBe(false);
    });

    it("putCard should store member's card if poker was started in the member's lobby", () => {
        const memberId = 1;
        const cardCode = CardCode.DontKnow;
        const dummyLobby = { id: 2, name: "DUMMY", state: LobbyState.Playing };

        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(dummyLobby.id);
        lobbyDAOMock.getById.calledWith(dummyLobby.id).mockReturnValue(dummyLobby);

        memberService.putCard(memberId, cardCode);
        expect(memberCardXrefDAOMock.put).toBeCalledTimes(1);
        expect(memberCardXrefDAOMock.put).toBeCalledWith(memberId, cardCode);
        expect(lobbyServiceMock.checkPoker).toBeCalledTimes(1);
        expect(lobbyServiceMock.checkPoker).toBeCalledWith(dummyLobby.id);
    });

    it("putCard should throw an error if poker wasn't started in the member's lobby", () => {
        const memberId = 1;
        const cardCode = CardCode.DontKnow;
        const dummyLobby = { id: 2, name: "DUMMY", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(dummyLobby.id);
        lobbyDAOMock.getById.calledWith(dummyLobby.id).mockReturnValue(dummyLobby);

        expect(() => memberService.putCard(memberId, cardCode)).toThrowError(PokerIsNotStartedError);
        expect(memberCardXrefDAOMock.put).not.toBeCalled();
        expect(memberCardXrefDAOMock.put).not.toBeCalled();
        expect(lobbyServiceMock.checkPoker).not.toBeCalled();
        expect(lobbyServiceMock.checkPoker).not.toBeCalled();
    });

    it("removeCard should remove member's card from storage if poker was started in the member's lobby", () => {
        const memberId = 1;
        const dummyLobby = { id: 2, name: "DUMMY", state: LobbyState.Playing };

        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(dummyLobby.id);
        lobbyDAOMock.getById.calledWith(dummyLobby.id).mockReturnValue(dummyLobby);

        memberService.removeCard(memberId);
        expect(memberCardXrefDAOMock.removeByMemberId).toBeCalledTimes(1);
        expect(memberCardXrefDAOMock.removeByMemberId).toBeCalledWith(memberId);
        expect(lobbyServiceMock.checkPoker).toBeCalledTimes(1);
        expect(lobbyServiceMock.checkPoker).toBeCalledWith(dummyLobby.id);
    });

    it("removeCard should throw an error if poker wasn't started in the member's lobby", () => {
        const memberId = 1;
        const dummyLobby = { id: 2, name: "DUMMY", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(dummyLobby.id);
        lobbyDAOMock.getById.calledWith(dummyLobby.id).mockReturnValue(dummyLobby);

        expect(() => memberService.removeCard(memberId)).toThrowError(PokerIsNotStartedError);
        expect(memberCardXrefDAOMock.removeByMemberId).not.toBeCalled();
        expect(memberCardXrefDAOMock.removeByMemberId).not.toBeCalled();
        expect(lobbyServiceMock.checkPoker).not.toBeCalled();
        expect(lobbyServiceMock.checkPoker).not.toBeCalled();
    });
});