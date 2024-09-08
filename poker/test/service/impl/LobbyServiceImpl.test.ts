import 'reflect-metadata';
import {
  anyFunction,
  anyNumber,
  anyString,
  mock,
  MockProxy,
  mockReset,
} from 'jest-mock-extended';

import {LOBBY_LIFETIME_SEC} from '@/config/app';
import {container} from '@/config/inversify';
import {
  DAO_TYPES,
  LobbyDAO,
  MemberCardXrefDAO,
  MemberDAO,
  MemberLobbyXrefDAO,
} from '@/data/api';
import {Lobby, Member, MemberCardXref} from '@/data/entity';
import {LobbyState} from '@/data/enum';
import {SCHEDULER_TYPES, TimeoutScheduler} from '@/scheduler/api';
import {TaskType} from '@/scheduler/enum';
import {
  CardService,
  LobbyService,
  SERVICE_TYPES,
  SubscriptionService,
} from '@/service/api';
import {
  LobbyAlreadyExistsError,
  MemberIsAlreadyInLobbyError,
  MemberIsNotInLobbyError,
  PokerIsAlreadyStartedError,
  UnknownMemberError,
} from '@/service/error';
import {EventType} from '@/service/event';
import LobbyServiceImpl from '@/service/impl/LobbyServiceImpl';

import {sameArray, sameObject} from '@test/test-utils/customMatchers';

describe('service/impl/LobbyServiceImpl', () => {
  let lobbyService: LobbyService;

  let lobbyDAOMock: MockProxy<LobbyDAO>;
  let memberLobbyXrefDAOMock: MockProxy<MemberLobbyXrefDAO>;
  let memberCardXrefDAOMock: MockProxy<MemberCardXrefDAO>;
  let memberDAOMock: MockProxy<MemberDAO>;
  let cardServiceMock: MockProxy<CardService>;
  let subscriptionServiceMock: MockProxy<SubscriptionService>;
  let timeoutSchedulerMock: MockProxy<TimeoutScheduler>;

  beforeAll(() => {
    container
      .bind<LobbyService>(SERVICE_TYPES.LobbyService)
      .to(LobbyServiceImpl);

    lobbyDAOMock = mock<LobbyDAO>();
    container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).toConstantValue(lobbyDAOMock);

    memberLobbyXrefDAOMock = mock<MemberLobbyXrefDAO>();
    container
      .bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO)
      .toConstantValue(memberLobbyXrefDAOMock);

    memberCardXrefDAOMock = mock<MemberCardXrefDAO>();
    container
      .bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO)
      .toConstantValue(memberCardXrefDAOMock);

    memberDAOMock = mock<MemberDAO>();
    container
      .bind<MemberDAO>(DAO_TYPES.MemberDAO)
      .toConstantValue(memberDAOMock);

    cardServiceMock = mock<CardService>();
    container
      .bind<CardService>(SERVICE_TYPES.CardService)
      .toConstantValue(cardServiceMock);

    subscriptionServiceMock = mock<SubscriptionService>();
    container
      .bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService)
      .toConstantValue(subscriptionServiceMock);

    timeoutSchedulerMock = mock<TimeoutScheduler>();
    container
      .bind<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler)
      .toConstantValue(timeoutSchedulerMock);

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

  it('getById must return an existed lobby', () => {
    const lobby: Lobby = {
      id: 1,
      name: 'dummy name',
      currentTheme: 'task 1234',
      state: LobbyState.Playing,
    };

    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.getById(lobby.id).then(returnedLobby => {
      expect(returnedLobby).toEqual(lobby);
    });
  });

  it("getById mustn't return not existed lobby", () => {
    lobbyDAOMock.getById
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve(null));

    return lobbyService.getById(1).then(returnedLobby => {
      expect(returnedLobby).toBeNull();
    });
  });

  it('getByName must return an existed lobby', () => {
    const lobby: Lobby = {
      id: 1,
      name: 'dummy name',
      currentTheme: 'task 1234',
      state: LobbyState.Playing,
    };

    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.getByName(lobby.name).then(returnedLobby => {
      expect(returnedLobby).toEqual(lobby);
    });
  });

  it("getByName mustn't return not existed lobby", () => {
    lobbyDAOMock.getByName
      .calledWith(anyString())
      .mockReturnValue(Promise.resolve(null));

    return lobbyService.getByName('dummy name').then(returnedLobby => {
      expect(returnedLobby).toBeNull();
    });
  });

  it("createLobby must create new lobby in Waiting status if lobby with the same name doesn't exist yet", () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    lobbyDAOMock.isExists
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(false));
    lobbyDAOMock.save
      .calledWith(sameObject({name: lobby.name, state: lobby.state}))
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.createLobby(lobby.name).then(() => {
      expect(lobbyDAOMock.save).toHaveBeenCalledWith({
        name: lobby.name,
        state: lobby.state,
      });
    });
  });

  it('createLobby must register new lobby for subscriptions', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    lobbyDAOMock.isExists
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(false));
    lobbyDAOMock.save
      .calledWith(sameObject({name: lobby.name, state: lobby.state}))
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.createLobby(lobby.name).then(() => {
      expect(subscriptionServiceMock.register).toHaveBeenCalledWith(lobby.id);
    });
  });

  it('createLobby must return new lobby', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    lobbyDAOMock.isExists
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(false));
    lobbyDAOMock.save
      .calledWith(sameObject({name: lobby.name, state: lobby.state}))
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.createLobby(lobby.name).then(returnedLobby => {
      expect(returnedLobby).toEqual(lobby);
    });
  });

  it('createLobby must throw an error if lobby with the same name already exists', () => {
    const lobbyName = 'dummy lobby name';

    lobbyDAOMock.isExists
      .calledWith(lobbyName)
      .mockReturnValue(Promise.resolve(true));

    return lobbyService.createLobby(lobbyName).catch(error => {
      expect(error).toBeInstanceOf(LobbyAlreadyExistsError);
    });
  });

  it('getMembersLobby must return a lobby by its member', () => {
    const memberId = 10;
    const lobby: Lobby = {
      id: 1,
      name: 'dummy name',
      currentTheme: 'task 1234',
      state: LobbyState.Playing,
    };

    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.getMembersLobby(memberId).then(returnedLobby => {
      expect(returnedLobby).toEqual(lobby);
    });
  });

  it("getMembersLobby mustn't return a lobby by not existed member", () => {
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve(null));
    lobbyDAOMock.getById
      .calledWith(null)
      .mockReturnValue(Promise.resolve(null));

    return lobbyService.getMembersLobby(10).then(returnedLobby => {
      expect(returnedLobby).toBeNull();
    });
  });

  it('enterMember must bind member to an existed lobby', () => {
    const memberId = 10;
    const lobby: Lobby = {id: 1, name: 'dummy name', state: LobbyState.Waiting};

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve([memberId]));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.enterMember(memberId, lobby.id).then(() => {
      expect(memberLobbyXrefDAOMock.bindMember).toHaveBeenCalledWith(
        memberId,
        lobby.id
      );
    });
  });

  it('enterMember must throw an exception if member is already in a lobby', () => {
    const member: Member = {id: 10, name: 'dummy member name'};
    const lobby: Lobby = {
      id: 1,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(true));
    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));

    return lobbyService.enterMember(member.id, lobby.id).catch(error => {
      expect(error).toBeInstanceOf(MemberIsAlreadyInLobbyError);
    });
  });

  it('enterMember must schedule lobby destruction', () => {
    const memberId = 10;
    const lobby: Lobby = {id: 1, name: 'dummy name', state: LobbyState.Waiting};

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve([memberId]));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.enterMember(memberId, lobby.id).then(() => {
      expect(timeoutSchedulerMock.schedule).toHaveBeenCalledWith(
        TaskType.Lobby,
        lobby.id,
        LOBBY_LIFETIME_SEC,
        anyFunction()
      );
    });
  });

  it('enterMember must dispatch MembersWasChanged event', () => {
    const memberId = 10;
    const lobby: Lobby = {id: 1, name: 'dummy name', state: LobbyState.Waiting};
    const members = [
      {id: 10, name: 'dummy member 1'},
      {id: 20, name: 'dummy member 2'},
      {id: 30, name: 'dummy member 3'},
      {id: 40, name: 'dummy member 4'},
    ];
    const memberIds = members.map(m => m.id);

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(members));
    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.enterMember(memberId, lobby.id).then(() => {
      expect(subscriptionServiceMock.dispatch).toHaveBeenCalledWith(lobby.id, {
        type: EventType.MembersWasChanged,
        payload: {members},
      });
    });
  });

  it('enterMember should dispatch PokerResultWasChanged event if lobby state is Playing', () => {
    const memberId = 10;
    const lobby: Lobby = {
      id: 1,
      name: 'dummy name',
      currentTheme: 'dummy theme',
      state: LobbyState.Playing,
    };
    const members: Record<number, Member> = [
      {id: 10, name: 'dummy member 1'},
      {id: 20, name: 'dummy member 2'},
      {id: 30, name: 'dummy member 3'},
      {id: 40, name: 'dummy member 4'},
    ].reduce(
      (membersById, member) => ({
        ...membersById,
        [member.id]: member,
      }),
      {}
    );
    const memberIds = Object.keys(members).map(memberId => Number(memberId));
    const memberCardXrefs: MemberCardXref[] = memberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));
    const pokerResult = memberCardXrefs.map(xref => ({
      member: members[xref.memberId],
      card: undefined,
    }));

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberLobbyXrefDAOMock.bindMember
      .calledWith(memberId, lobby.id)
      .mockReturnValue(Promise.resolve());
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(memberCardXrefs));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(Object.values(members)));
    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.enterMember(memberId, lobby.id).then(() => {
      expect(subscriptionServiceMock.dispatch).toHaveBeenNthCalledWith(
        2,
        lobby.id,
        {
          type: EventType.PokerResultWasChanged,
          payload: {theme: lobby.currentTheme, result: pokerResult},
        }
      );
    });
  });

  it("enterMember mustn't dispatch PokerResultWasChanged event if lobby state isn't Playing", () => {
    const memberId = 10;
    const lobby: Lobby = {id: 1, name: 'dummy name', state: LobbyState.Waiting};
    const members: Record<number, Member> = [
      {id: 10, name: 'dummy member 1'},
      {id: 20, name: 'dummy member 2'},
      {id: 30, name: 'dummy member 3'},
      {id: 40, name: 'dummy member 4'},
    ].reduce(
      (membersById, member) => ({
        ...membersById,
        [member.id]: member,
      }),
      {}
    );
    const memberIds = Object.keys(members).map(memberId => Number(memberId));
    const memberCardXrefs: MemberCardXref[] = memberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));
    const pokerResult = memberCardXrefs.map(xref => ({
      member: members[xref.memberId],
      card: null,
    }));

    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(memberCardXrefs));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(Object.values(members)));
    lobbyDAOMock.getByName
      .calledWith(lobby.name)
      .mockReturnValue(Promise.resolve(lobby));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));

    return lobbyService.enterMember(memberId, lobby.id).then(() => {
      expect(subscriptionServiceMock.dispatch).not.toHaveBeenCalledWith(
        lobby.id,
        {
          type: EventType.PokerResultWasChanged,
          payload: {result: pokerResult},
        }
      );
    });
  });

  it('leaveMember must unbind a member from his lobby', () => {
    const member: Member = {id: 1, name: 'dummy member name'};
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(true));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve([]));
    memberDAOMock.getByIds
      .calledWith(sameArray([]))
      .mockReturnValue(Promise.resolve([]));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray([]))
      .mockReturnValue(Promise.resolve([]));

    return lobbyService.leaveMember(member.id, lobby.id).then(() => {
      expect(memberLobbyXrefDAOMock.unbindMember).toHaveBeenCalledWith(
        member.id
      );
      expect(memberCardXrefDAOMock.removeByMemberId).toHaveBeenCalledWith(
        member.id
      );
      expect(subscriptionServiceMock.unsubscribe).toHaveBeenCalledWith(
        member.id
      );
    });
  });

  it('leaveMember must dispatch MembersWasChanged event', () => {
    const member: Member = {id: 1, name: 'dummy member name 1'};
    const otherMembers: Member[] = [
      {id: 2, name: 'dummy member name 2'},
      {id: 3, name: 'dummy member name 3'},
      {id: 4, name: 'dummy member name 4'},
    ];
    const otherMemberIds = otherMembers.map(m => m.id);
    const otherMemberCards: MemberCardXref[] = otherMemberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Playing,
    };

    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(true));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(otherMemberIds));
    memberDAOMock.getByIds
      .calledWith(sameArray(otherMemberIds))
      .mockReturnValue(Promise.resolve(otherMembers));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(otherMemberIds))
      .mockReturnValue(Promise.resolve(otherMemberCards));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));

    return lobbyService.leaveMember(member.id, lobby.id).then(() => {
      expect(subscriptionServiceMock.dispatch).toHaveBeenCalledWith(lobby.id, {
        type: EventType.MembersWasChanged,
        payload: {members: otherMembers},
      });
    });
  });

  it('leaveMember must destroy lobby if it was called with a last member', () => {
    const member: Member = {id: 1, name: 'dummy member name'};
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };

    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(true));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve([]));
    memberDAOMock.getByIds
      .calledWith(sameArray([]))
      .mockReturnValue(Promise.resolve([]));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray([]))
      .mockReturnValue(Promise.resolve([]));

    return lobbyService.leaveMember(member.id, lobby.id).then(() => {
      expect(timeoutSchedulerMock.cancel).toHaveBeenCalledWith(
        TaskType.Lobby,
        lobby.id
      );
      expect(memberCardXrefDAOMock.removeByMemberIds).toHaveBeenCalledWith(
        sameArray([])
      );
      expect(memberLobbyXrefDAOMock.unbindMembers).toHaveBeenCalledWith(
        lobby.id
      );
      expect(memberDAOMock.deleteByIds).toHaveBeenCalledWith(sameArray([]));
      expect(lobbyDAOMock.deleteById).toHaveBeenCalledWith(lobby.id);
      expect(subscriptionServiceMock.unregister).toHaveBeenCalledWith(lobby.id);
      expect(subscriptionServiceMock.dispatch).toHaveBeenCalledWith(lobby.id, {
        type: EventType.LobbyWasDestroyed,
      });
    });
  });

  it('leaveMember must schedule lobby destruction if it was called with a not last member', () => {
    const member: Member = {id: 1, name: 'dummy member name 1'};
    const otherMembers: Member[] = [
      {id: 2, name: 'dummy member name 2'},
      {id: 3, name: 'dummy member name 3'},
      {id: 4, name: 'dummy member name 4'},
    ];
    const otherMemberIds = otherMembers.map(m => m.id);
    const otherMemberCards: MemberCardXref[] = otherMemberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Playing,
    };

    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(true));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(lobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(otherMemberIds));
    memberDAOMock.getByIds
      .calledWith(sameArray(otherMemberIds))
      .mockReturnValue(Promise.resolve(otherMembers));
    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(otherMemberIds))
      .mockReturnValue(Promise.resolve(otherMemberCards));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));

    return lobbyService.leaveMember(member.id, lobby.id).then(() => {
      expect(timeoutSchedulerMock.schedule).toHaveBeenCalledWith(
        TaskType.Lobby,
        lobby.id,
        LOBBY_LIFETIME_SEC,
        anyFunction()
      );
    });
  });

  it("leaveMember must throw an exception if the member doesn't exist", () => {
    memberDAOMock.getById
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve(null));

    return lobbyService.leaveMember(1, 10).catch(error => {
      expect(error).toBeInstanceOf(UnknownMemberError);
    });
  });

  it("leaveMember must throw an exception if the member isn't includes into lobby", () => {
    const member: Member = {id: 1, name: 'dummy member name 1'};
    const lobbyId = 10;

    memberDAOMock.getById
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(member));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(member.id)
      .mockReturnValue(Promise.resolve(null));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));

    return lobbyService.leaveMember(member.id, lobbyId).catch(error => {
      expect(error).toBeInstanceOf(MemberIsNotInLobbyError);
    });
  });

  it('startPoker must change current poker theme and lobby state', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };
    const theme = 'dummy poker theme';
    const members: Record<number, Member> = [
      {id: 1, name: 'dummy member 1'},
      {id: 2, name: 'dummy member 2'},
      {id: 3, name: 'dummy member 3'},
      {id: 4, name: 'dummy member 4'},
    ].reduce(
      (membersById, member) => ({
        ...membersById,
        [member.id]: member,
      }),
      {}
    );
    const memberIds = Object.keys(members).map(memberId => Number(memberId));
    const memberCardXrefs: MemberCardXref[] = memberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));

    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(memberCardXrefs));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(Object.values(members)));

    return lobbyService.startPoker(lobby.id, theme).then(() => {
      expect(lobbyDAOMock.save).toHaveBeenCalledWith({
        ...lobby,
        currentTheme: theme,
        state: LobbyState.Playing,
      });
    });
  });

  it('startPoker must schedule lobby destruction', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };
    const theme = 'dummy poker theme';
    const members: Record<number, Member> = [
      {id: 1, name: 'dummy member 1'},
      {id: 2, name: 'dummy member 2'},
      {id: 3, name: 'dummy member 3'},
      {id: 4, name: 'dummy member 4'},
    ].reduce(
      (membersById, member) => ({
        ...membersById,
        [member.id]: member,
      }),
      {}
    );
    const memberIds = Object.keys(members).map(memberId => Number(memberId));
    const memberCardXrefs: MemberCardXref[] = memberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));

    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(memberCardXrefs));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(Object.values(members)));

    return lobbyService.startPoker(lobby.id, theme).then(() => {
      expect(timeoutSchedulerMock.schedule).toHaveBeenCalledWith(
        TaskType.Lobby,
        lobby.id,
        LOBBY_LIFETIME_SEC,
        anyFunction()
      );
    });
  });

  it('startPoker must dispatch PokerResultWasChanged event', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      state: LobbyState.Waiting,
    };
    const theme = 'dummy poker theme';
    const members: Record<number, Member> = [
      {id: 1, name: 'dummy member 1'},
      {id: 2, name: 'dummy member 2'},
      {id: 3, name: 'dummy member 3'},
      {id: 4, name: 'dummy member 4'},
    ].reduce(
      (membersById, member) => ({
        ...membersById,
        [member.id]: member,
      }),
      {}
    );
    const memberIds = Object.keys(members).map(memberId => Number(memberId));
    const memberCardXrefs: MemberCardXref[] = memberIds.map(memberId => ({
      memberId,
      cardCode: null,
    }));
    const pokerResult = memberCardXrefs.map(xref => ({
      member: members[xref.memberId],
      card: undefined,
    }));

    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValueOnce(Promise.resolve(lobby))
      .mockReturnValueOnce(
        Promise.resolve({
          ...lobby,
          currentTheme: theme,
          state: LobbyState.Playing,
        })
      );
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(memberIds));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(memberCardXrefs));
    memberDAOMock.getByIds
      .calledWith(sameArray(memberIds))
      .mockReturnValue(Promise.resolve(Object.values(members)));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));

    return lobbyService.startPoker(lobby.id, theme).then(() => {
      expect(subscriptionServiceMock.dispatch).toHaveBeenCalledWith(lobby.id, {
        type: EventType.PokerResultWasChanged,
        payload: {theme, result: pokerResult},
      });
    });
  });

  it('startPoker must throw an error if poker have been already started', () => {
    const lobby: Lobby = {
      id: 10,
      name: 'dummy lobby name',
      currentTheme: 'current dummy poker theme',
      state: LobbyState.Playing,
    };
    const theme = 'dummy poker theme';

    lobbyDAOMock.getById
      .calledWith(lobby.id)
      .mockReturnValue(Promise.resolve(lobby));
    cardServiceMock.getAll.calledWith().mockReturnValue(Promise.resolve([]));

    return lobbyService.startPoker(lobby.id, theme).catch(error => {
      expect(error).toBeInstanceOf(PokerIsAlreadyStartedError);
    });
  });
});
