import { inject, injectable } from "inversify";

import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { CardCode } from "data/enum";
import { Lobby, Member } from "data/entity";
import { LobbyState } from "data/enum";

import {
    LobbyAlreadyExistsError,
    MemberDoesntExist,
    MemberIsAlreadyInLobbyError,
    MemberIsNotInLobbyError,
    PokerIsAlreadyStartedError,
} from "../error";
import { LobbyService, SERVICE_TYPES, SubscriptionService } from "../api";
import { CardDto, LobbyDto, PokerResultItemDto } from "../dto";
import { EventType } from "../event";

@injectable()
export default class LobbyServiceImpl implements LobbyService {

    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;
    @inject(DAO_TYPES.MemberLobbyXrefDAO) private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;
    @inject(DAO_TYPES.MemberCardXrefDAO) private readonly memberCardXrefDAO: MemberCardXrefDAO;
    @inject(SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    private lobbyDestroyTimeouts = new Map<number, NodeJS.Timeout>();

    getById(id: number): LobbyDto {
        return this.fromEntityToDto(this.lobbyDAO.getById(id));
    }

    getByName(name: string): LobbyDto {
        return this.fromEntityToDto(this.lobbyDAO.getByName(name));
    }

    delete(id: number): void {
        this.lobbyDAO.delete(id);
    }

    isExists(name: string): boolean {
        return this.lobbyDAO.isExists(name);
    }

    getMembers(lobbyId: number): Member[] {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        return this.memberDAO.getByIds(memberIds);
    }

    enterMember(memberId: number, lobbyName: string): LobbyDto {
        if (this.memberLobbyXrefDAO.isMemberBound(memberId)) {
            const membersLobbyId = this.memberLobbyXrefDAO.getMembersBinding(memberId);
            const membersLobby = this.lobbyDAO.getById(membersLobbyId);
            const member = this.memberDAO.getById(memberId);
            throw new MemberIsAlreadyInLobbyError(member, membersLobby);
        }

        const lobby = this.getByName(lobbyName) || this.createLobby(lobbyName);
        this.memberLobbyXrefDAO.bindMember(memberId, lobby.id);

        this.subscriptionService.dispatch(lobby.id, {
            type: EventType.MembersWasChanged,
            payload: { members: this.getMembers(lobby.id) },
        });

        this.checkPokerResult(lobby.id);

        this.refreshLobbyDestroyTimeout(lobby.id);

        return lobby;
    }

    leaveMember(memberId: number): void {
        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new MemberDoesntExist();
        }

        if (!this.memberLobbyXrefDAO.isMemberBound(memberId)) {
            throw new MemberIsNotInLobbyError(member);
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

        this.checkPokerResult(lobbyId);

        if (members.length) {
            this.refreshLobbyDestroyTimeout(lobbyId);
        } else {
            clearTimeout(this.lobbyDestroyTimeouts.get(lobbyId));
            this.lobbyDAO.delete(lobbyId);
        }

    }

    startPoker(lobbyId: number, theme: string): void {
        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state !== LobbyState.Waiting) {
            throw new PokerIsAlreadyStartedError(lobby);
        }

        this.lobbyDAO.save({ ...lobby, currentTheme: theme, state: LobbyState.Playing });

        this.refreshLobbyDestroyTimeout(lobbyId);

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.PokerWasStarted,
            payload: { theme, result: this.getPokerResult(lobbyId) },
        });
    }

    finishPoker(lobbyId: number): void {
        const lobby = this.lobbyDAO.getById(lobbyId);
        this.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting });

        this.refreshLobbyDestroyTimeout(lobbyId);

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.PokerWasFinished,
            payload: { result: this.getPokerFinishResult(lobbyId) },
        });

        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        this.memberCardXrefDAO.removeByMemberIds(memberIds);
    }

    getPokerResult(lobbyId: number): PokerResultItemDto[] {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
        const cards = this.memberCardXrefDAO.getByMemberIds(memberIds)
            .reduce((cardsById, [ memberId, cardCode ]) => ({
                ...cardsById,
                [ memberId ]: CardDto.fromCode(cardCode),
            }), {});
        const members = this.memberDAO.getByIds(memberIds);

        return members.map(member => ({ member, card: cards[ member.id ] }));
    }

    getPokerFinishResult(lobbyId: number): PokerResultItemDto[] {
        const pokerResult = this.getPokerResult(lobbyId);
        const cards = pokerResult.map(resultItem => resultItem.card);

        const sortedCards = cards
            .filter(card => card.isComparable())
            .sort((left, right) => left.compareTo(right));

        const minCard = sortedCards[ 0 ];
        const maxCard = sortedCards[ sortedCards.length - 1 ];
        const notComparableCards = cards.filter(card => !card.isComparable());

        let minMaxResult;
        let specialResult;

        if (minCard !== maxCard) {
            const minResult = pokerResult.filter(resultItem => resultItem.card === minCard);
            const maxResult = pokerResult.filter(resultItem => resultItem.card === maxCard);
            minMaxResult = minResult.concat(maxResult);
        } else {
            minMaxResult = [];
        }

        if (notComparableCards.length) {
            specialResult = pokerResult.filter(resultItem => notComparableCards.includes(resultItem.card));
        } else {
            specialResult = [];
        }

        return minMaxResult.concat(specialResult);
    }

    private createLobby(lobbyName: string): LobbyDto {
        if (this.lobbyDAO.isExists(lobbyName)) {
            const existedLobby = this.lobbyDAO.getByName(lobbyName);
            throw new LobbyAlreadyExistsError(existedLobby);
        }

        const createdLobby = this.lobbyDAO.save({ name: lobbyName, state: LobbyState.Waiting });

        this.refreshLobbyDestroyTimeout(createdLobby.id);
        this.subscriptionService.register(createdLobby.id);

        this.subscriptionService.lobbySubscribe(createdLobby.id, event => {
            if (event.type === EventType.PokerResultWasChanged) {
                if (event.payload.result.every(item => !!item.card)) {
                    this.finishPoker(createdLobby.id);
                }
            }
        });

        return {
            ...createdLobby,
            members: [],
            cards: new Map<number, CardDto<CardCode>>(),
        };
    }

    private destroyLobby(lobbyId: number) {
        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);

        this.subscriptionService.dispatch(lobbyId, {
            type: EventType.LobbyWasDestroyed,
            payload: { lobby: this.lobbyDAO.getById(lobbyId) },
        });

        this.memberCardXrefDAO.removeByMemberIds(memberIds);
        this.memberLobbyXrefDAO.unbindMembers(lobbyId);
        this.memberDAO.deleteByIds(memberIds);
        this.lobbyDAO.delete(lobbyId);

        this.subscriptionService.unregister(lobbyId);
    }

    private checkPokerResult(lobbyId: number): void {
        const lobby = this.lobbyDAO.getById(lobbyId);
        if (lobby.state === LobbyState.Playing) {
            this.subscriptionService.dispatch(lobbyId, {
                type: EventType.PokerResultWasChanged,
                payload: { result: this.getPokerResult(lobbyId) },
            });
        }
    }

    private fromEntityToDto(lobby: Lobby): LobbyDto {
        if (!lobby) {
            return null;
        }

        const memberIds = this.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobby.id);
        const members = this.memberDAO.getByIds(memberIds);
        const cards = new Map<number, CardDto<CardCode>>(
            this.memberCardXrefDAO.getByMemberIds(memberIds)
                .map(([ memberId, cardCode ]) => [ memberId, CardDto.fromCode(cardCode) ]));

        return { ...lobby, members, cards };
    }

    private refreshLobbyDestroyTimeout(lobbyId: number): void {
        clearTimeout(this.lobbyDestroyTimeouts.get(lobbyId));
        const destroyTimeout = setTimeout(() => this.destroyLobby(lobbyId), LOBBY_LIFETIME_MS);
        this.lobbyDestroyTimeouts.set(lobbyId, destroyTimeout);
    }

}
