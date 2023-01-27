import "reflect-metadata";
import { Container, BindingScopeEnum } from "inversify";
import { mock, mockReset, anyNumber, MockProxy } from "jest-mock-extended";

import { MemberDAO, MemberCardXrefDAO, MemberLobbyXrefDAO, LobbyDAO, DAO_TYPES } from "data/api";
import { MemberService, SubscriptionService, LobbyService, SERVICE_TYPES } from "service/api";
import { UnknownMemberError } from "service/error";

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

    it("should return a member if getById was called with ID of that member", () => {
        const dummyMember = { id: 1, name: "dummy" };
        memberDAOMock.getById.calledWith(dummyMember.id).mockReturnValue(dummyMember);

        expect(memberService.getById(dummyMember.id)).toBe(dummyMember);
    });

    it("should throw an error if getById was called with ID of not existed member", () => {
        memberDAOMock.getById.calledWith(anyNumber()).mockReturnValue(null);

        expect(() => memberService.getById(1)).toThrowError(UnknownMemberError);
    });
});