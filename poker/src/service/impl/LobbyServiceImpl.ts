import {inject, injectable} from 'inversify';

import {
  DAO_TYPES,
  LobbyDAO,
  MemberCardXrefDAO,
  MemberDAO,
  MemberLobbyXrefDAO,
} from '@/data/api';
import {Lobby} from '@/data/entity';
import {LobbyState} from '@/data/enum';

import {
  DispatchMembers,
  DispatchPokerResult,
  LobbyId,
  MemberId,
  ResetLobbyLifetime,
} from '../aop';
import {LobbyService, SERVICE_TYPES, SubscriptionService} from '../api';
import {
  LobbyAlreadyExistsError,
  MemberIsAlreadyInLobbyError,
  MemberIsNotInLobbyError,
  PokerIsAlreadyStartedError,
  PokerIsNotStartedError,
  UnknownLobbyError,
  UnknownMemberError,
} from '../error';

@injectable()
export default class LobbyServiceImpl implements LobbyService {
  @inject(DAO_TYPES.LobbyDAO)
  private readonly lobbyDAO: LobbyDAO;

  @inject(DAO_TYPES.MemberDAO)
  private readonly memberDAO: MemberDAO;

  @inject(DAO_TYPES.MemberLobbyXrefDAO)
  private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;

  @inject(DAO_TYPES.MemberCardXrefDAO)
  private readonly memberCardXrefDAO: MemberCardXrefDAO;

  @inject(SERVICE_TYPES.SubscriptionService)
  private readonly subscriptionService: SubscriptionService;

  async getById(id: number): Promise<Lobby> {
    const lobby = await this.lobbyDAO.getById(id);

    if (!lobby) {
      throw new UnknownLobbyError();
    }

    return lobby;
  }

  async getByName(name: string): Promise<Lobby> {
    const lobby = await this.lobbyDAO.getByName(name);

    if (!lobby) {
      throw new UnknownLobbyError();
    }

    return lobby;
  }

  createLobby(name: string): Promise<Lobby> {
    return this.lobbyDAO
      .isExists(name)
      .then(isExists => {
        if (isExists) {
          throw new LobbyAlreadyExistsError(name);
        }
      })
      .then(() => this.lobbyDAO.save({name, state: LobbyState.Waiting}))
      .then(createdLobby => {
        this.subscriptionService.register(createdLobby.id);
        return createdLobby;
      });
  }

  async getMembersLobby(memberId: number): Promise<Lobby> {
    const lobbyId = await this.memberLobbyXrefDAO.getMembersBinding(memberId);

    if (!lobbyId) {
      throw new UnknownLobbyError();
    }

    return await this.lobbyDAO.getById(lobbyId);
  }

  @ResetLobbyLifetime
  @DispatchPokerResult
  @DispatchMembers
  enterMember(
    @MemberId memberId: number,
    @LobbyId lobbyId: number
  ): Promise<void> {
    return this.memberLobbyXrefDAO
      .isMemberBound(memberId)
      .then(async isMemberBound => {
        if (isMemberBound) {
          const member = await this.memberDAO.getById(memberId);
          throw new MemberIsAlreadyInLobbyError(member.name);
        }
      })
      .then(() => this.memberLobbyXrefDAO.bindMember(memberId, lobbyId));
  }

  @ResetLobbyLifetime
  @DispatchPokerResult
  @DispatchMembers
  leaveMember(
    @MemberId memberId: number,
    @LobbyId lobbyId: number
  ): Promise<void> {
    return this.memberDAO
      .getById(memberId)
      .then(member => {
        if (!member) {
          throw new UnknownMemberError();
        }
        return member;
      })
      .then(member =>
        this.memberLobbyXrefDAO
          .getMembersBinding(memberId)
          .then(membersLobbyId => {
            if (lobbyId !== membersLobbyId) {
              throw new MemberIsNotInLobbyError(member.name);
            }
          })
      )
      .then(() =>
        Promise.all([
          this.memberLobbyXrefDAO.unbindMember(memberId),
          this.memberCardXrefDAO.removeByMemberId(memberId),
        ])
      )
      .then(() => this.subscriptionService.unsubscribe(memberId));
  }

  @ResetLobbyLifetime
  @DispatchPokerResult
  startPoker(@LobbyId lobbyId: number, theme: string): Promise<void> {
    return this.lobbyDAO
      .getById(lobbyId)
      .then(lobby => {
        if (lobby.state === LobbyState.Playing) {
          throw new PokerIsAlreadyStartedError(lobby);
        }
        return lobby;
      })
      .then(async lobby => {
        await this.lobbyDAO.save({
          ...lobby,
          currentTheme: theme,
          state: LobbyState.Playing,
        });
      });
  }

  @ResetLobbyLifetime
  cancelPoker(@LobbyId lobbyId: number): Promise<void> {
    return this.lobbyDAO
      .getById(lobbyId)
      .then(lobby => {
        if (lobby.state === LobbyState.Waiting) {
          throw new PokerIsNotStartedError(lobby);
        }
        return lobby;
      })
      .then(async lobby => {
        await Promise.all([
          this.lobbyDAO.save({
            ...lobby,
            currentTheme: null,
            state: LobbyState.Waiting,
          }),
          this.memberLobbyXrefDAO
            .getMemberIdsByLobbyId(lobby.id)
            .then(memberIds =>
              this.memberCardXrefDAO.removeByMemberIds(memberIds)
            ),
        ]);
      });
  }
}
