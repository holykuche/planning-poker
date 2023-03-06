import { inject, injectable } from "inversify";

import { COMMON_DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/common-data/api";
import { Lobby } from "data/common-data/entity";
import { LobbyState } from "data/common-data/enum";

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

    @inject(COMMON_DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(COMMON_DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;
    @inject(COMMON_DAO_TYPES.MemberLobbyXrefDAO) private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;
    @inject(COMMON_DAO_TYPES.MemberCardXrefDAO) private readonly memberCardXrefDAO: MemberCardXrefDAO;
    @inject(COMMON_SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    getById(id: number): Lobby {
        return this.lobbyDAO.getById(id);
    }

    getByName(name: string): Lobby {
        return this.lobbyDAO.getByName(name);
    }

    createLobby(name: string): Lobby {
        if (this.lobbyDAO.isExists(name)) {
            throw new LobbyAlreadyExists(name);
        }

        const createdLobby = this.lobbyDAO.save({ name, state: LobbyState.Waiting });
        this.subscriptionService.register(createdLobby.id);
        return createdLobby;
    }

    getMembersLobby(memberId: number): Lobby {
        const lobbyId = this.memberLobbyXrefDAO.getMembersBinding(memberId);
        return this.lobbyDAO.getById(lobbyId);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    @DispatchMembers
    enterMember(@MemberId memberId: number, lobbyId: number): void {
        if (this.memberLobbyXrefDAO.isMemberBound(memberId)) {
            const member = this.memberDAO.getById(memberId);
            throw new MemberIsAlreadyInLobbyError(member.name);
        }

        this.memberLobbyXrefDAO.bindMember(memberId, lobbyId);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    @DispatchMembers
    leaveMember(memberId: number, @LobbyId lobbyId: number): void {
        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new UnknownMemberError();
        }

        if (lobbyId !== this.memberLobbyXrefDAO.getMembersBinding(memberId)) {
            throw new MemberIsNotInLobbyError(member.name);
        }

        this.memberLobbyXrefDAO.unbindMember(memberId);
        this.memberCardXrefDAO.removeByMemberId(memberId);
        this.subscriptionService.unsubscribe(memberId);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    startPoker(@LobbyId lobbyId: number, theme: string): void {
        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state === LobbyState.Playing) {
            throw new PokerIsAlreadyStartedError(lobby);
        }

        this.lobbyDAO.save({ ...lobby, currentTheme: theme, state: LobbyState.Playing });
    }

    @ResetLobbyLifetime
    cancelPoker(@LobbyId lobbyId: number): void {
        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state === LobbyState.Waiting) {
            throw new PokerIsNotStartedError(lobby);
        }

        this.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting });
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobby.id);
        this.memberCardXrefDAO.removeByMemberIds(memberIds);
    }

}
