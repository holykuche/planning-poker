import { container } from "inversify.config";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import LobbyState from "data/enum/LobbyState";

import { SERVICE_TYPES, SubscriptionService } from "../../api";
import { CardDto, PokerResultItemDto } from "../../dto";
import { EventType } from "../../event";

import MetadataKey from "../MetadataKey";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO,
    memberCardXrefDAO: MemberCardXrefDAO,
    memberDAO: MemberDAO,
    lobbyDAO: LobbyDAO,
    subscriptionService: SubscriptionService,
}

const getPokerResult = function (lobbyId: number, dependencies: Dependencies): PokerResultItemDto[] {
    const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
    const cards = dependencies.memberCardXrefDAO.getCardsByMemberIds(memberIds)
        .reduce((cardsById, { memberId, cardCode }) => ({
            ...cardsById,
            [ memberId ]: CardDto.fromCode(cardCode),
        }), {});
    const members = dependencies.memberDAO.getByIds(memberIds);

    return members.map(member => ({ member, card: cards[ member.id ] }));
};

const finishPoker = function (lobbyId: number, pokerResult: PokerResultItemDto[], dependencies: Dependencies): void {
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
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO),
            memberCardXrefDAO: container.get<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO),
            memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
            lobbyDAO: container.get<LobbyDAO>(DAO_TYPES.LobbyDAO),
            subscriptionService: container.get<SubscriptionService>(SERVICE_TYPES.SubscriptionService),
        };

        let lobbyId: number;

        const lobbyIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.LobbyId, target, propertyKey);
        const memberIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.MemberId, target, propertyKey);
        if (typeof lobbyIdParameterIndex === "number") {
            lobbyId = args[ lobbyIdParameterIndex ];
        } else if (typeof memberIdParameterIndex === "number") {
            const memberId = args[ memberIdParameterIndex ];
            lobbyId = dependencies.memberLobbyXrefDAO.getMembersBinding(memberId);
        } else {
            throw new Error("Wrong DispatchPokerResult usage. You should mark lobbyId or memberId in parameters.")
        }

        const { currentTheme, state } = dependencies.lobbyDAO.getById(lobbyId);

        if (state === LobbyState.Playing) {
            const pokerResult = getPokerResult(lobbyId, dependencies);

            if (pokerResult.every(item => !!item.card)) {
                finishPoker(lobbyId, pokerResult, dependencies);
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
