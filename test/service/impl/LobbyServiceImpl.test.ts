import "reflect-metadata";
import { BindingScopeEnum, Container } from "inversify";
import { anyFunction, anyNumber, anyString, mock, MockProxy, mockReset } from "jest-mock-extended";

import CONFIG_TYPES from "config/types";
import { Lobby, Member, MemberCardXref } from "data/entity";
import { LobbyState } from "data/enum";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { LobbyService, SERVICE_TYPES, SubscriptionService } from "service/api";
import { MemberIsAlreadyInLobbyError, MemberIsNotInLobbyError, UnknownMemberError } from "service/error";
import { EventType } from "service/event";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";
import { TaskType } from "scheduler/enum";

import LobbyServiceImpl from "service/impl/LobbyServiceImpl";

import { sameArray, sameObject } from "../../customMatchers";

describe("service/impl/LobbyServiceImpl", () => {

    let lobbyService: LobbyService;

    let lobbyDAOMock: MockProxy<LobbyDAO>;
    let memberLobbyXrefDAOMock: MockProxy<MemberLobbyXrefDAO>;
    let memberCardXrefDAOMock: MockProxy<MemberCardXrefDAO>;
    let memberDAOMock: MockProxy<MemberDAO>;
    let subscriptionServiceMock: MockProxy<SubscriptionService>;
    let timeoutSchedulerMock: MockProxy<TimeoutScheduler>;

    const lobbyLifetimeMs = 10 * 1000; // 10 seconds

    beforeAll(() => {
        const container = new Container({ defaultScope: BindingScopeEnum.Singleton });
        container.bind<LobbyService>(SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);

        lobbyDAOMock = mock<LobbyDAO>();
        container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).toConstantValue(lobbyDAOMock);

        memberLobbyXrefDAOMock = mock<MemberLobbyXrefDAO>();
        container.bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO).toConstantValue(memberLobbyXrefDAOMock);

        memberCardXrefDAOMock = mock<MemberCardXrefDAO>();
        container.bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO).toConstantValue(memberCardXrefDAOMock);

        memberDAOMock = mock<MemberDAO>();
        container.bind<MemberDAO>(DAO_TYPES.MemberDAO).toConstantValue(memberDAOMock);

        subscriptionServiceMock = mock<SubscriptionService>();
        container.bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService).toConstantValue(subscriptionServiceMock);

        timeoutSchedulerMock = mock<TimeoutScheduler>();
        container.bind<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler).toConstantValue(timeoutSchedulerMock);

        container.bind<number>(CONFIG_TYPES.LobbyLifetimeMs).toConstantValue(lobbyLifetimeMs);

        lobbyService = container.get<LobbyService>(SERVICE_TYPES.LobbyService);
    });

    beforeEach(() => {
        mockReset(lobbyDAOMock);
        mockReset(memberLobbyXrefDAOMock);
        mockReset(memberCardXrefDAOMock);
        mockReset(memberDAOMock);
        mockReset(subscriptionServiceMock);
        mockReset(timeoutSchedulerMock);
    });

    it("getById should return an existed lobby", () => {
        const lobby: Lobby = { id: 1, name: "dummy name", currentTheme: "task 1234", state: LobbyState.Playing };

        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);

        expect(lobbyService.getById(lobby.id)).toEqual(lobby);
    });

    it("getById shouldn't return not existed lobby", () => {
        lobbyDAOMock.getById.calledWith(anyNumber()).mockReturnValue(null);
        expect(lobbyService.getById(1)).toBeNull();
    });

    it("getByName should return an existed lobby", () => {
        const lobby: Lobby = { id: 1, name: "dummy name", currentTheme: "task 1234", state: LobbyState.Playing };

        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);

        expect(lobbyService.getByName(lobby.name)).toEqual(lobby);
    });

    it("getByName shouldn't return not existed lobby", () => {
        lobbyDAOMock.getByName.calledWith(anyString()).mockReturnValue(null);
        expect(lobbyService.getByName("dummy name")).toBeNull();
    });

    it("getMembers should return members by their lobby", () => {
        const lobbyId = 1;
        const members = [
            { id: 10, name: "dummy member 1" },
            { id: 20, name: "dummy member 2" },
            { id: 30, name: "dummy member 3" },
            { id: 40, name: "dummy member 4" },
        ];
        const memberIds = members.map(m => m.id);

        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobbyId).mockReturnValue(memberIds);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(members);

        expect(lobbyService.getMembers(lobbyId)).toEqual(members);
    });

    it("getMembers shouldn't return members by not existed lobby", () => {
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(anyNumber()).mockReturnValue([]);
        memberDAOMock.getByIds.calledWith(sameArray([])).mockReturnValue([]);

        expect(lobbyService.getMembers(1)).toEqual([]);
    });

    it("getMembersLobby should return a lobby by its member", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", currentTheme: "task 1234", state: LobbyState.Playing };

        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);

        expect(lobbyService.getMembersLobby(memberId)).toEqual(lobby);
    });

    it("getMembersLobby shouldn't return a lobby by not existed member", () => {
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(anyNumber()).mockReturnValue(null);
        lobbyDAOMock.getById.calledWith(null).mockReturnValue(null);

        expect(lobbyService.getMembersLobby(10)).toBeNull();
    });

    it("enterMember should bind member to an existed lobby", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);

        lobbyService.enterMember(memberId, lobby.name);
        expect(lobbyDAOMock.save).not.toBeCalled();
        expect(memberLobbyXrefDAOMock.bindMember).toBeCalledWith(memberId, lobby.id);
    });

    it("enterMember should bind member to a new lobby", () => {
        const memberId = 10;
        const newLobbyId = 1;
        const lobby: Lobby = { name: "dummy name", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(null);
        lobbyDAOMock.save.calledWith(sameObject(lobby)).mockReturnValue({ id: newLobbyId, ...lobby });

        lobbyService.enterMember(memberId, lobby.name);
        expect(lobbyDAOMock.save).toBeCalledWith(lobby);
        expect(subscriptionServiceMock.register).toBeCalledWith(newLobbyId);
        expect(memberLobbyXrefDAOMock.bindMember).toBeCalledWith(memberId, newLobbyId);
    });

    it("enterMember should throw an exception if member is already in a lobby", () => {
        const member: Member = { id: 10, name: "dummy member name" };
        const lobbyName = "dummy lobby name";

        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(true);
        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);

        expect(() => lobbyService.enterMember(member.id, lobbyName)).toThrowError(MemberIsAlreadyInLobbyError);
    });

    it("enterMember should schedule destroying the lobby", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);

        lobbyService.enterMember(memberId, lobby.name);
        expect(timeoutSchedulerMock.schedule).toBeCalledWith(TaskType.Lobby, lobby.id, lobbyLifetimeMs / 1000, anyFunction());
    });

    it("enterMember should dispatch MembersWasChanged event", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Waiting };
        const members = [
            { id: 10, name: "dummy member 1" },
            { id: 20, name: "dummy member 2" },
            { id: 30, name: "dummy member 3" },
            { id: 40, name: "dummy member 4" },
        ];
        const memberIds = members.map(m => m.id);

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(members);

        lobbyService.enterMember(memberId, lobby.name);
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.MembersWasChanged,
            payload: { members },
        });
    });

    it("leaveMember should unbind a member from his lobby", () => {
        const member: Member = { id: 1, name: "dummy member name" };
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Waiting };

        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);
        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(true);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(member.id).mockReturnValue(lobby.id);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue([]);
        memberDAOMock.getByIds.calledWith(sameArray([])).mockReturnValue([]);
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray([])).mockReturnValue([]);

        lobbyService.leaveMember(member.id);
        expect(memberLobbyXrefDAOMock.unbindMember).toBeCalledWith(member.id);
        expect(memberCardXrefDAOMock.removeByMemberId).toBeCalledWith(member.id);
        expect(subscriptionServiceMock.unsubscribe).toBeCalledWith(member.id);
    });

    it("leaveMember should dispatch MembersWasChanged event", () => {
        const member: Member = { id: 1, name: "dummy member name 1" };
        const otherMembers: Member[] = [
            { id: 2, name: "dummy member name 2" },
            { id: 3, name: "dummy member name 3" },
            { id: 4, name: "dummy member name 4" },
        ];
        const otherMemberIds = otherMembers.map(m => m.id);
        const otherMemberCards: MemberCardXref[] = otherMemberIds.map(memberId => ({ memberId, cardCode: null }));
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Playing };

        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);
        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(true);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(member.id).mockReturnValue(lobby.id);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(otherMemberIds);
        memberDAOMock.getByIds.calledWith(sameArray(otherMemberIds)).mockReturnValue(otherMembers);
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(otherMemberIds)).mockReturnValue(otherMemberCards);

        lobbyService.leaveMember(member.id);
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.MembersWasChanged,
            payload: { members: otherMembers },
        });
    });

    it("leaveMember should destroy lobby if it was called with a last member", () => {
        const member: Member = { id: 1, name: "dummy member name" };
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Waiting };

        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);
        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(true);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(member.id).mockReturnValue(lobby.id);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue([]);
        memberDAOMock.getByIds.calledWith(sameArray([])).mockReturnValue([]);
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray([])).mockReturnValue([]);

        lobbyService.leaveMember(member.id);
        expect(timeoutSchedulerMock.cancel).toBeCalledWith(TaskType.Lobby, lobby.id);
        expect(memberCardXrefDAOMock.removeByMemberIds).toBeCalledWith(sameArray([]));
        expect(memberLobbyXrefDAOMock.unbindMembers).toBeCalledWith(lobby.id);
        expect(memberDAOMock.deleteByIds).toBeCalledWith(sameArray([]));
        expect(lobbyDAOMock.deleteById).toBeCalledWith(lobby.id);
        expect(subscriptionServiceMock.unregister).toBeCalledWith(lobby.id);
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.LobbyWasDestroyed,
        });
    });

    it("leaveMember should schedule lobby destruction if it was called with a not last member", () => {
        const member: Member = { id: 1, name: "dummy member name 1" };
        const otherMembers: Member[] = [
            { id: 2, name: "dummy member name 2" },
            { id: 3, name: "dummy member name 3" },
            { id: 4, name: "dummy member name 4" },
        ];
        const otherMemberIds = otherMembers.map(m => m.id);
        const otherMemberCards: MemberCardXref[] = otherMemberIds.map(memberId => ({ memberId, cardCode: null }));
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Playing };

        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);
        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(true);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(member.id).mockReturnValue(lobby.id);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(otherMemberIds);
        memberDAOMock.getByIds.calledWith(sameArray(otherMemberIds)).mockReturnValue(otherMembers);
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(otherMemberIds)).mockReturnValue(otherMemberCards);

        lobbyService.leaveMember(member.id);
        expect(timeoutSchedulerMock.schedule).toBeCalledWith(TaskType.Lobby, lobby.id, lobbyLifetimeMs / 1000, anyFunction());
    });

    it("leaveMember should throw an exception if the member doesn't exist", () => {
        memberDAOMock.getById.calledWith(anyNumber()).mockReturnValue(null);

        expect(() => lobbyService.leaveMember(1)).toThrowError(UnknownMemberError);
    });

    it("leaveMember should throw an exception if the member isn't includes into any lobby", () => {
        const member: Member = { id: 1, name: "dummy member name 1" };

        memberDAOMock.getById.calledWith(member.id).mockReturnValue(member);
        memberLobbyXrefDAOMock.isMemberBound.calledWith(member.id).mockReturnValue(false);

        expect(() => lobbyService.leaveMember(member.id)).toThrowError(MemberIsNotInLobbyError);
    });
});