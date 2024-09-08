import 'reflect-metadata';

import {mock, mockReset, anyNumber, MockProxy} from 'jest-mock-extended';

import {container} from '@/config/inversify';
import {
  MemberDAO,
  MemberCardXrefDAO,
  MemberLobbyXrefDAO,
  LobbyDAO,
  DAO_TYPES,
} from '@/data/api';
import {CardCode, LobbyState} from '@/data/enum';
import {SCHEDULER_TYPES, TimeoutScheduler} from '@/scheduler/api';
import {
  MemberService,
  LobbyService,
  SERVICE_TYPES,
  SubscriptionService,
} from '@/service/api';
import {
  MemberIsNotInLobbyError,
  PokerIsNotStartedError,
  UnknownMemberError,
} from '@/service/error';
import MemberServiceImpl from '@/service/impl/MemberServiceImpl';

import {sameArray, sameObject} from '../../test-utils/customMatchers';

describe('service/common-service/impl/MemberServiceImpl', () => {
  let memberService: MemberService;

  let memberDAOMock: MockProxy<MemberDAO>;
  let memberCardXrefDAOMock: MockProxy<MemberCardXrefDAO>;
  let memberLobbyXrefDAOMock: MockProxy<MemberLobbyXrefDAO>;
  let lobbyDAOMock: MockProxy<LobbyDAO>;
  let lobbyServiceMock: MockProxy<LobbyService>;
  let subscriptionServiceMock: MockProxy<SubscriptionService>;
  let timeoutSchedulerMock: MockProxy<TimeoutScheduler>;

  beforeAll(() => {
    container
      .bind<MemberService>(SERVICE_TYPES.MemberService)
      .to(MemberServiceImpl);

    memberDAOMock = mock<MemberDAO>();
    container
      .bind<MemberDAO>(DAO_TYPES.MemberDAO)
      .toConstantValue(memberDAOMock);

    memberCardXrefDAOMock = mock<MemberCardXrefDAO>();
    container
      .bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO)
      .toConstantValue(memberCardXrefDAOMock);

    memberLobbyXrefDAOMock = mock<MemberLobbyXrefDAO>();
    container
      .bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO)
      .toConstantValue(memberLobbyXrefDAOMock);

    lobbyDAOMock = mock<LobbyDAO>();
    container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).toConstantValue(lobbyDAOMock);

    lobbyServiceMock = mock<LobbyService>();
    container
      .bind<LobbyService>(SERVICE_TYPES.LobbyService)
      .toConstantValue(lobbyServiceMock);

    subscriptionServiceMock = mock<SubscriptionService>();
    container
      .bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService)
      .toConstantValue(subscriptionServiceMock);

    timeoutSchedulerMock = mock<TimeoutScheduler>();
    container
      .bind<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler)
      .toConstantValue(timeoutSchedulerMock);

    memberService = container.get<MemberService>(SERVICE_TYPES.MemberService);
  });

  beforeEach(() => {
    mockReset(memberDAOMock);
    mockReset(memberCardXrefDAOMock);
    mockReset(memberLobbyXrefDAOMock);
    mockReset(lobbyDAOMock);
    mockReset(lobbyServiceMock);
  });

  it("getById should return a member if it was called with that member's ID", () => {
    const dummyMember = {id: 1, name: 'dummy'};
    memberDAOMock.getById
      .calledWith(dummyMember.id)
      .mockReturnValue(Promise.resolve(dummyMember));

    return memberService.getById(dummyMember.id).then(returnedMember => {
      expect(returnedMember).toBe(dummyMember);
    });
  });

  it('getById should throw an error if it was called with ID of not existed member', () => {
    memberDAOMock.getById
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve(null));

    return memberService.getById(1).catch(error => {
      expect(error).toBeInstanceOf(UnknownMemberError);
    });
  });

  it("getMembersLobbyId should return a lobby ID if it was called with member's ID who id involved into a lobby", () => {
    const memberId = 1;
    const membersLobbyId = 2;
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(membersLobbyId));

    return memberService.getMembersLobbyId(memberId).then(returnedLobbyId => {
      expect(returnedLobbyId).toBe(membersLobbyId);
    });
  });

  it("getMembersLobbyId should throw an error if it was called with member's ID who isn't involved into any lobby", () => {
    memberDAOMock.getById
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve({id: 1, name: 'dummy'}));
    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(anyNumber())
      .mockReturnValue(Promise.resolve(null));

    return memberService.getMembersLobbyId(1).catch(error => {
      expect(error).toBeInstanceOf(MemberIsNotInLobbyError);
    });
  });

  it("isMemberInLobby should return true if it was called with member's ID who is involved into a lobby", () => {
    const memberId = 1;
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(true));

    return memberService
      .isMemberInLobby(memberId)
      .then(returnedIsMemberInLobby => {
        expect(returnedIsMemberInLobby).toBe(true);
      });
  });

  it("isMemberInLobby should return false if it was called with member's ID who isn't involved into any lobby", () => {
    const memberId = 1;
    memberLobbyXrefDAOMock.isMemberBound
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(false));

    return memberService
      .isMemberInLobby(memberId)
      .then(returnedIsMemberInLobby => {
        expect(returnedIsMemberInLobby).toBe(false);
      });
  });

  it("putCard should store member's card if poker was started in the member's lobby", () => {
    const memberId = 1;
    const cardCode = CardCode.DontKnow;
    const dummyLobby = {id: 2, name: 'DUMMY', state: LobbyState.Playing};

    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(dummyLobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve([memberId]));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray([memberId]))
      .mockReturnValue(Promise.resolve([{memberId, cardCode}]));
    lobbyDAOMock.getById
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve(dummyLobby));
    memberDAOMock.getByIds
      .calledWith(sameArray([memberId]))
      .mockReturnValue(
        Promise.resolve([{id: memberId, name: 'dummy member name'}])
      );
    lobbyDAOMock.save
      .calledWith(
        sameObject({
          ...dummyLobby,
          currentTheme: null,
          state: LobbyState.Waiting,
        })
      )
      .mockReturnValue(
        Promise.resolve({
          ...dummyLobby,
          currentTheme: null,
          state: LobbyState.Waiting,
        })
      );

    return memberService.putCard(memberId, cardCode).then(() => {
      expect(memberCardXrefDAOMock.put).toBeCalledTimes(1);
      expect(memberCardXrefDAOMock.put).toBeCalledWith(memberId, cardCode);
    });
  });

  it("putCard should throw an error if poker wasn't started in the member's lobby", () => {
    const memberId = 1;
    const cardCode = CardCode.DontKnow;
    const dummyLobby = {id: 2, name: 'DUMMY', state: LobbyState.Waiting};

    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(dummyLobby.id));
    lobbyDAOMock.getById
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve(dummyLobby));

    return memberService.putCard(memberId, cardCode).catch(error => {
      expect(error).toBeInstanceOf(PokerIsNotStartedError);
      expect(memberCardXrefDAOMock.put).not.toBeCalled();
      expect(memberCardXrefDAOMock.put).not.toBeCalled();
    });
  });

  it("removeCard should remove member's card from storage if poker was started in the member's lobby", () => {
    const memberId = 1;
    const dummyLobby = {id: 2, name: 'DUMMY', state: LobbyState.Playing};

    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(dummyLobby.id));
    memberLobbyXrefDAOMock.getMemberIdsByLobbyId
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve([memberId]));
    memberCardXrefDAOMock.getCardsByMemberIds
      .calledWith(sameArray([memberId]))
      .mockReturnValue(Promise.resolve([{memberId, cardCode: null}]));
    lobbyDAOMock.getById
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve(dummyLobby));
    memberDAOMock.getByIds
      .calledWith(sameArray([memberId]))
      .mockReturnValue(
        Promise.resolve([{id: memberId, name: 'dummy member name'}])
      );

    return memberService.removeCard(memberId).then(() => {
      expect(memberCardXrefDAOMock.removeByMemberId).toBeCalledTimes(1);
      expect(memberCardXrefDAOMock.removeByMemberId).toBeCalledWith(memberId);
    });
  });

  it("removeCard should throw an error if poker wasn't started in the member's lobby", () => {
    const memberId = 1;
    const dummyLobby = {id: 2, name: 'DUMMY', state: LobbyState.Waiting};

    memberLobbyXrefDAOMock.getMembersBinding
      .calledWith(memberId)
      .mockReturnValue(Promise.resolve(dummyLobby.id));
    lobbyDAOMock.getById
      .calledWith(dummyLobby.id)
      .mockReturnValue(Promise.resolve(dummyLobby));

    return memberService.removeCard(memberId).catch(error => {
      expect(error).toBeInstanceOf(PokerIsNotStartedError);
      expect(memberCardXrefDAOMock.removeByMemberId).not.toBeCalled();
      expect(memberCardXrefDAOMock.removeByMemberId).not.toBeCalled();
    });
  });
});
