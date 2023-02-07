import { inject, injectable } from "inversify";

import CONFIG_TYPES from "config/types";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { Lobby, Member } from "data/entity";
import { LobbyState } from "data/enum";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";
import { TaskType } from "scheduler/enum";

import {
    MemberIsAlreadyInLobbyError,
    MemberIsNotInLobbyError,
    PokerIsAlreadyStartedError,
    UnknownMemberError,
} from "../error";
import { LobbyService, SERVICE_TYPES, SubscriptionService } from "../api";
import { CardDto, PokerResultItemDto } from "../dto";
import { EventType } from "../event";

@injectable()
export default class LobbyServiceImpl implements LobbyService {

    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;
    @inject(DAO_TYPES.MemberLobbyXrefDAO) private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;
    @inject(DAO_TYPES.MemberCardXrefDAO) private readonly memberCardXrefDAO: MemberCardXrefDAO;
    @inject(SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;
    @inject(SCHEDULER_TYPES.TimeoutScheduler) private readonly timeoutScheduler: TimeoutScheduler;
    @inject(CONFIG_TYPES.LobbyLifetimeMs) private readonly lobbyLifetimeMs: number;

    getById(id: number): Lobby {
        return this.lobbyDAO.getById(id);
    }

    getByName(name: string): Lobby {
        return this.lobbyDAO.getByName(name);
    }

    getMembers(lobbyId: number): Member[] {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        return this.memberDAO.getByIds(memberIds);
    }

    getMembersLobby(memberId: number): Lobby {
        const lobbyId = this.memberLobbyXrefDAO.getMembersBinding(memberId);
        return this.lobbyDAO.getById(lobbyId);
    }

    enterMember(memberId: number, lobbyName: string): void {
        if (this.memberLobbyXrefDAO.isMemberBound(memberId)) {
            const member = this.memberDAO.getById(memberId);
            throw new MemberIsAlreadyInLobbyError(member.name);
        }

        const lobby = this.getByName(lobbyName) || this.createLobby(lobbyName);
        this.memberLobbyXrefDAO.bindMember(memberId, lobby.id);

        this.scheduleLobbyDestroy(lobby.id);

        this.subscriptionService.dispatch(lobby.id, {
            type: EventType.MembersWasChanged,
            payload: { members: this.getMembers(lobby.id) },
        });

        if (lobby.state === LobbyState.Playing) {
            this.subscriptionService.dispatch(lobby.id, {
                type: EventType.PokerResultWasChanged,
                payload: { result: this.getPokerResult(lobby.id) },
            });
        }
    }

    leaveMember(memberId: number): void {
        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new UnknownMemberError();
        }

        if (!this.memberLobbyXrefDAO.isMemberBound(memberId)) {
            throw new MemberIsNotInLobbyError(member.name);
        }

        const lobbyId = this.memberLobbyXrefDAO.getMembersBinding(memberId);
        this.memberLobbyXrefDAO.unbindMember(memberId);
        this.memberCardXrefDAO.removeByMemberId(memberId);

        const members = this.getMembers(lobbyId);

        this.subscriptionService.unsubscribe(memberId);
        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.MembersWasChanged,
            payload: { members },
        });

        const lobby = this.lobbyDAO.getById(lobbyId);
        if (lobby.state === LobbyState.Playing) {
            this.checkPoker(lobbyId);
        }

        if (members.length) {
            this.scheduleLobbyDestroy(lobbyId);
        } else {
            this.cancelScheduledLobbyDestroy(lobbyId);
            this.destroyLobby(lobbyId);
        }

    }

    startPoker(lobbyId: number, theme: string): void {
        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state !== LobbyState.Waiting) {
            throw new PokerIsAlreadyStartedError(lobby);
        }

        this.lobbyDAO.save({ ...lobby, currentTheme: theme, state: LobbyState.Playing });

        this.scheduleLobbyDestroy(lobbyId);

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.PokerWasStarted,
            payload: { theme, result: this.getPokerResult(lobbyId) },
        });
    }

    checkPoker(lobbyId: number): void {
        const result = this.getPokerResult(lobbyId);

        if (result.every(item => !!item.card)) {
            this.finishPoker(lobbyId);
        } else {
            this.subscriptionService.dispatch(lobbyId, {
                type: EventType.PokerResultWasChanged,
                payload: { result },
            });
        }
    }

    finishPoker(lobbyId: number): void {
        const lobby = this.lobbyDAO.getById(lobbyId);
        this.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting });

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.PokerWasFinished,
            payload: { theme: lobby.currentTheme, result: this.getPokerResult(lobbyId) },
        });

        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        this.memberCardXrefDAO.removeByMemberIds(memberIds);
    }

    getPokerResult(lobbyId: number): PokerResultItemDto[] {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        const cards = this.memberCardXrefDAO.getCardsByMemberIds(memberIds)
            .reduce((cardsById, { memberId, cardCode }) => ({
                ...cardsById,
                [ memberId ]: CardDto.fromCode(cardCode),
            }), {});
        const members = this.memberDAO.getByIds(memberIds);

        return members.map(member => ({ member, card: cards[ member.id ] }));
    }

    scheduleLobbyDestroy(lobbyId: number): void {
        this.timeoutScheduler.schedule(TaskType.Lobby, lobbyId, this.lobbyLifetimeMs / 1000, () => this.destroyLobby(lobbyId));
    }

    private cancelScheduledLobbyDestroy(lobbyId: number): void {
        this.timeoutScheduler.cancel(TaskType.Lobby, lobbyId);
    }

    private createLobby(lobbyName: string): Lobby {
        const createdLobby = this.lobbyDAO.save({ name: lobbyName, state: LobbyState.Waiting });
        this.subscriptionService.register(createdLobby.id);
        return createdLobby;
    }

    private destroyLobby(lobbyId: number): void {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.LobbyWasDestroyed,
        });

        this.memberCardXrefDAO.removeByMemberIds(memberIds);
        this.memberLobbyXrefDAO.unbindMembers(lobbyId);
        this.memberDAO.deleteByIds(memberIds);
        this.lobbyDAO.deleteById(lobbyId);

        this.subscriptionService.unregister(lobbyId);
    }

}
