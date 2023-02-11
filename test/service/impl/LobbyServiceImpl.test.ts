import "reflect-metadata";
import { anyFunction, anyNumber, anyString, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "inversify.config";
import CONFIG_TYPES from "config/types";
import { Lobby, Member, MemberCardXref } from "data/entity";
import { CardCode, LobbyState } from "data/enum";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { LobbyService, SERVICE_TYPES, SubscriptionService } from "service/api";
import {
    MemberIsAlreadyInLobbyError,
    MemberIsNotInLobbyError,
    PokerIsAlreadyStartedError,
    UnknownMemberError,
} from "service/error";
import { EventType } from "service/event";
import { CardDto, PokerResultItemDto } from "service/dto";
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
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue([ memberId ]);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
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
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue([ memberId ]);
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

    it("enterMember should schedule lobby destruction", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Waiting };

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue([ memberId ]);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
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
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(members);

        lobbyService.enterMember(memberId, lobby.name);
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.MembersWasChanged,
            payload: { members },
        });
    });

    it("enterMember should dispatch PokerResultWasChanged event if lobby state is Playing", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Playing };
        const members: Record<number, Member> = [
            { id: 10, name: "dummy member 1" },
            { id: 20, name: "dummy member 2" },
            { id: 30, name: "dummy member 3" },
            { id: 40, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: MemberCardXref[] = memberIds
            .map(memberId => ({ memberId, cardCode: null }));
        const pokerResult = memberCardXrefs
            .map(xref => ({
                member: members[ xref.memberId ],
                card: null,
            }));

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(memberCardXrefs);

        lobbyService.enterMember(memberId, lobby.name);
        expect(subscriptionServiceMock.dispatch).toHaveBeenNthCalledWith(2, lobby.id, {
            type: EventType.PokerResultWasChanged,
            payload: { result: pokerResult },
        });
    });

    it("enterMember shouldn't dispatch PokerResultWasChanged event if lobby state isn't Playing", () => {
        const memberId = 10;
        const lobby: Lobby = { id: 1, name: "dummy name", state: LobbyState.Waiting };
        const members: Record<number, Member> = [
            { id: 10, name: "dummy member 1" },
            { id: 20, name: "dummy member 2" },
            { id: 30, name: "dummy member 3" },
            { id: 40, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: MemberCardXref[] = memberIds
            .map(memberId => ({ memberId, cardCode: null }));
        const pokerResult = memberCardXrefs
            .map(xref => ({
                member: members[ xref.memberId ],
                card: null,
            }));

        memberLobbyXrefDAOMock.isMemberBound.calledWith(memberId).mockReturnValue(false);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberLobbyXrefDAOMock.getMembersBinding.calledWith(memberId).mockReturnValue(lobby.id);
        lobbyDAOMock.getByName.calledWith(lobby.name).mockReturnValue(lobby);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(memberCardXrefs);

        lobbyService.enterMember(memberId, lobby.name);
        expect(subscriptionServiceMock.dispatch).not.toBeCalledWith(lobby.id, {
            type: EventType.PokerResultWasChanged,
            payload: { result: pokerResult },
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

    it("startPoker should change current poker theme and lobby state", () => {
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Waiting };
        const theme = "dummy poker theme";
        const members: Record<number, Member> = [
            { id: 1, name: "dummy member 1" },
            { id: 2, name: "dummy member 2" },
            { id: 3, name: "dummy member 3" },
            { id: 4, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: MemberCardXref[] = memberIds
            .map(memberId => ({ memberId, cardCode: null }));

        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(memberCardXrefs);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));

        lobbyService.startPoker(lobby.id, theme);
        expect(lobbyDAOMock.save).toBeCalledWith({ ...lobby, currentTheme: theme, state: LobbyState.Playing });
    });

    it("startPoker should schedule lobby destruction", () => {
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Waiting };
        const theme = "dummy poker theme";
        const members: Record<number, Member> = [
            { id: 1, name: "dummy member 1" },
            { id: 2, name: "dummy member 2" },
            { id: 3, name: "dummy member 3" },
            { id: 4, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: MemberCardXref[] = memberIds
            .map(memberId => ({ memberId, cardCode: null }));

        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(memberCardXrefs);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));

        lobbyService.startPoker(lobby.id, theme);
        expect(timeoutSchedulerMock.schedule).toBeCalledWith(TaskType.Lobby, lobby.id, lobbyLifetimeMs / 1000, anyFunction());
    });

    it("startPoker should dispatch PokerWasStarted event", () => {
        const lobby: Lobby = { id: 10, name: "dummy lobby name", state: LobbyState.Waiting };
        const theme = "dummy poker theme";
        const members: Record<number, Member> = [
            { id: 1, name: "dummy member 1" },
            { id: 2, name: "dummy member 2" },
            { id: 3, name: "dummy member 3" },
            { id: 4, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: MemberCardXref[] = memberIds
            .map(memberId => ({ memberId, cardCode: null }));
        const pokerResult = memberCardXrefs
            .map(xref => ({
                member: members[ xref.memberId ],
                card: null,
            }));

        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);
        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(memberCardXrefs);
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));

        lobbyService.startPoker(lobby.id, theme);
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.PokerWasStarted,
            payload: { theme, result: pokerResult },
        });
    });

    it("startPoker should throw an error if poker have been already started", () => {
        const lobby: Lobby = {
            id: 10,
            name: "dummy lobby name",
            currentTheme: "current dummy poker theme",
            state: LobbyState.Playing,
        };
        const theme = "dummy poker theme";

        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);

        expect(() => lobbyService.startPoker(lobby.id, theme)).toThrowError(PokerIsAlreadyStartedError);
    });

    it("checkPokerResult should finish poker if all members have picked a card", () => {
        const lobby: Lobby = {
            id: 10,
            name: "dummy lobby name",
            currentTheme: "current dummy poker theme",
            state: LobbyState.Playing,
        };
        const members: Record<number, Member> = [
            { id: 1, name: "dummy member 1" },
            { id: 2, name: "dummy member 2" },
            { id: 3, name: "dummy member 3" },
            { id: 4, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: Record<number, MemberCardXref> = {
            1: { memberId: 1, cardCode: CardCode.DontKnow },
            2: { memberId: 2, cardCode: CardCode.Score40 },
            3: { memberId: 3, cardCode: CardCode.Score20 },
            4: { memberId: 4, cardCode: CardCode.Score40 },
        };
        const pokerResult: PokerResultItemDto[] = Object.values(memberCardXrefs)
            .map(xref => ({
                member: members[ xref.memberId ],
                card: CardDto.fromCode(xref.cardCode),
            }));

        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(memberCardXrefs));
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));
        lobbyDAOMock.getById.calledWith(lobby.id).mockReturnValue(lobby);

        lobbyService.checkPokerResult(lobby.id);
        expect(lobbyDAOMock.save).toBeCalledWith({ ...lobby, currentTheme: null, state: LobbyState.Waiting });
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.PokerWasFinished,
            payload: { theme: lobby.currentTheme, result: pokerResult },
        });
        expect(memberCardXrefDAOMock.removeByMemberIds).toBeCalledWith(memberIds);
    });

    it("checkPokerResult shouldn't finish poker if not all members have picked a card", () => {
        const lobby: Lobby = {
            id: 10,
            name: "dummy lobby name",
            currentTheme: "current dummy poker theme",
            state: LobbyState.Playing,
        };
        const members: Record<number, Member> = [
            { id: 1, name: "dummy member 1" },
            { id: 2, name: "dummy member 2" },
            { id: 3, name: "dummy member 3" },
            { id: 4, name: "dummy member 4" },
        ]
            .reduce((membersById, member) => ({
                ...membersById,
                [ member.id ]: member,
            }), {});
        const memberIds = Object.keys(members).map(memberId => Number(memberId));
        const memberCardXrefs: Record<number, MemberCardXref> = {
            1: { memberId: 1, cardCode: CardCode.DontKnow },
            2: { memberId: 2, cardCode: CardCode.Score40 },
            3: { memberId: 3, cardCode: CardCode.Score20 },
            4: { memberId: 4, cardCode: null },
        };
        const pokerResult: PokerResultItemDto[] = Object.values(memberCardXrefs)
            .map(xref => ({
                member: members[ xref.memberId ],
                card: CardDto.fromCode(xref.cardCode),
            }));

        memberLobbyXrefDAOMock.getMemberIdsByLobbyId.calledWith(lobby.id).mockReturnValue(memberIds);
        memberCardXrefDAOMock.getCardsByMemberIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(memberCardXrefs));
        memberDAOMock.getByIds.calledWith(sameArray(memberIds)).mockReturnValue(Object.values(members));

        lobbyService.checkPokerResult(lobby.id);
        expect(lobbyDAOMock.save).not.toBeCalled();
        expect(memberCardXrefDAOMock.removeByMemberIds).not.toBeCalled();
        expect(subscriptionServiceMock.dispatch).toBeCalledWith(lobby.id, {
            type: EventType.PokerResultWasChanged,
            payload: { result: pokerResult },
        });
    });
});
