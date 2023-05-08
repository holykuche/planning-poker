import { inject, injectable } from "inversify";

import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { Lobby } from "data/entity";
import { LobbyState } from "data/enum";

import {
    LobbyAlreadyExists,
    MemberIsAlreadyInLobbyError,
    MemberIsNotInLobbyError,
    PokerIsAlreadyStartedError,
    PokerIsNotStartedError,
    UnknownMemberError,
} from "../error";
import { LobbyService, COMMON_SERVICE_TYPES, SubscriptionService } from "../api";
import { DispatchMembers, DispatchPokerResult, LobbyId, MemberId, ResetLobbyLifetime } from "../aop";

@injectable()
export default class LobbyServiceImpl implements LobbyService {

    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;
    @inject(DAO_TYPES.MemberLobbyXrefDAO) private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;
    @inject(DAO_TYPES.MemberCardXrefDAO) private readonly memberCardXrefDAO: MemberCardXrefDAO;
    @inject(COMMON_SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    getById(id: number): Promise<Lobby> {
        return this.lobbyDAO.getById(id);
    }

    getByName(name: string): Promise<Lobby> {
        return this.lobbyDAO.getByName(name);
    }

    createLobby(name: string): Promise<Lobby> {
        return this.lobbyDAO.isExists(name)
            .then(isExists => {
                if (isExists) {
                    throw new LobbyAlreadyExists(name);
                }
            })
            .then(() => this.lobbyDAO.save({ name, state: LobbyState.Waiting }))
            .then(createdLobby => {
                this.subscriptionService.register(createdLobby.id);
                return createdLobby;
            });
    }

    getMembersLobby(memberId: number): Promise<Lobby> {
        return this.memberLobbyXrefDAO.getMembersBinding(memberId)
            .then(lobbyId => this.lobbyDAO.getById(lobbyId));
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    @DispatchMembers
    enterMember(@MemberId memberId: number, lobbyId: number): Promise<void> {
        return this.memberLobbyXrefDAO.isMemberBound(memberId)
            .then(isMemberBound => {
                return isMemberBound
                    ? this.memberDAO.getById(memberId)
                        .then(member => {
                            throw new MemberIsAlreadyInLobbyError(member.name);
                        })
                    : Promise.resolve();
            })
            .then(() => this.memberLobbyXrefDAO.bindMember(memberId, lobbyId));
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    @DispatchMembers
    leaveMember(memberId: number, @LobbyId lobbyId: number): Promise<void> {
        return this.memberDAO.getById(memberId)
            .then(member => {
                if (!member) {
                    throw new UnknownMemberError();
                }
                return member;
            })
            .then(member => {
                return this.memberLobbyXrefDAO.getMembersBinding(memberId)
                    .then(membersLobbyId => {
                        if (lobbyId !== membersLobbyId) {
                            throw new MemberIsNotInLobbyError(member.name);
                        }
                    })
            })
            .then(() => Promise.all([
                this.memberLobbyXrefDAO.unbindMember(memberId),
                this.memberCardXrefDAO.removeByMemberId(memberId)
            ]))
            .then(() => this.subscriptionService.unsubscribe(memberId));
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    startPoker(@LobbyId lobbyId: number, theme: string): Promise<void> {
        return this.lobbyDAO.getById(lobbyId)
            .then(lobby => {
                if (lobby.state === LobbyState.Playing) {
                    throw new PokerIsAlreadyStartedError(lobby);
                }
                return lobby;
            })
            .then(lobby => this.lobbyDAO.save({ ...lobby, currentTheme: theme, state: LobbyState.Playing }))
            .then();
    }

    @ResetLobbyLifetime
    cancelPoker(@LobbyId lobbyId: number): Promise<void> {
        return this.lobbyDAO.getById(lobbyId)
            .then(lobby => {
                if (lobby.state === LobbyState.Waiting) {
                    throw new PokerIsNotStartedError(lobby);
                }
                return lobby;
            })
            .then(lobby => Promise.all([
                this.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting }),
                this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobby.id)
                    .then(memberIds => this.memberCardXrefDAO.removeByMemberIds(memberIds))
            ]))
            .then();
    }

}
