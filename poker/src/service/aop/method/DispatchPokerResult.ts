import { container } from "config/inversify";
import { COMMON_DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import LobbyState from "data/enum/LobbyState";

import { COMMON_SERVICE_TYPES, SubscriptionService } from "../../api";
import { CardDto, PokerResultItemDto } from "../../dto";
import { EventType } from "../../event";

import { resolveLobbyId } from "../common";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberCardXrefDAO: MemberCardXrefDAO;
    memberDAO: MemberDAO;
    lobbyDAO: LobbyDAO;
    subscriptionService: SubscriptionService;
}

const getPokerResult = function (dependencies: Dependencies, lobbyId: number): PokerResultItemDto[] {
    const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
    const cards = dependencies.memberCardXrefDAO.getCardsByMemberIds(memberIds)
        .reduce((cardsById, { memberId, cardCode }) => ({
            ...cardsById,
            [ memberId ]: CardDto.fromCode(cardCode),
        }), {});
    const members = dependencies.memberDAO.getByIds(memberIds);

    return members.map(member => ({ member, card: cards[ member.id ] }));
};

const finishPoker = function (dependencies: Dependencies, lobbyId: number, pokerResult: PokerResultItemDto[]): void {
    const lobby = dependencies.lobbyDAO.getById(lobbyId);
    dependencies.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting });

    dependencies.subscriptionService.dispatch(lobbyId, {
        type: EventType.PokerWasFinished,
        payload: { theme: lobby.currentTheme, result: pokerResult },
    });

    const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
    dependencies.memberCardXrefDAO.removeByMemberIds(memberIds);
}

export default function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = method.apply(this, args);

        const dependencies: Dependencies = {
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(COMMON_DAO_TYPES.MemberLobbyXrefDAO),
            memberCardXrefDAO: container.get<MemberCardXrefDAO>(COMMON_DAO_TYPES.MemberCardXrefDAO),
            memberDAO: container.get<MemberDAO>(COMMON_DAO_TYPES.MemberDAO),
            lobbyDAO: container.get<LobbyDAO>(COMMON_DAO_TYPES.LobbyDAO),
            subscriptionService: container.get<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService),
        };

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        const { currentTheme, state } = dependencies.lobbyDAO.getById(lobbyId);

        if (state === LobbyState.Playing) {
            const pokerResult = getPokerResult(dependencies, lobbyId);

            if (pokerResult.every(item => !!item.card)) {
                finishPoker(dependencies, lobbyId, pokerResult);
            } else {
                dependencies.subscriptionService.dispatch(lobbyId, {
                    type: EventType.PokerResultWasChanged,
                    payload: { theme: currentTheme, result: pokerResult },
                });
            }
        }

        return result;
    }
}
