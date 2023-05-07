import { container } from "config/inversify";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import LobbyState from "data/enum/LobbyState";

import { COMMON_SERVICE_TYPES, SubscriptionService } from "../../api";
import { CardDto, PokerResultItemDto } from "../../dto";
import { PokerIsNotStartedError } from "../../error";
import { EventType } from "../../event";

import { resolveLobbyId } from "../common";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberCardXrefDAO: MemberCardXrefDAO;
    memberDAO: MemberDAO;
    lobbyDAO: LobbyDAO;
    subscriptionService: SubscriptionService;
}

const getPokerResult = function (dependencies: Dependencies, lobbyId: number): Promise<PokerResultItemDto[]> {
    return dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId)
        .then(memberIds =>
            dependencies.memberCardXrefDAO.getCardsByMemberIds(memberIds)
                .then(cards => ({
                    cards,
                    memberIds,
                }))
        )
        .then(({ cards, memberIds }) => ({
            cards: cards
                .reduce((cardsByMemberId, { memberId, cardCode }) => ({
                    ...cardsByMemberId,
                    [ memberId ]: CardDto.fromCode(cardCode),
                }), {} as Record<number, CardDto>),
            memberIds,
        }))
        .then(({ cards, memberIds }) =>
            dependencies.memberDAO.getByIds(memberIds)
                .then(members => members.map(member => ({ member, card: cards[ member.id ] })))
        );
};

const finishPoker = function (dependencies: Dependencies, lobbyId: number, pokerResult: PokerResultItemDto[]): Promise<void> {
    return dependencies.lobbyDAO.getById(lobbyId)
        .then(lobby => dependencies.lobbyDAO.save({ ...lobby, currentTheme: null, state: LobbyState.Waiting }))
        .then(lobby => dependencies.subscriptionService.dispatch(lobby.id, {
            type: EventType.PokerWasFinished,
            payload: { theme: lobby.currentTheme, result: pokerResult },
        }))
        .then(() => dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId))
        .then(memberIds => dependencies.memberCardXrefDAO.removeByMemberIds(memberIds));
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
            subscriptionService: container.get<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService),
        };

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        return Promise.resolve(result)
            .then(resultValue =>
                dependencies.lobbyDAO.getById(lobbyId)
                    .then(lobby => {
                        if (lobby.state !== LobbyState.Playing) {
                            throw new PokerIsNotStartedError(lobby);
                        }
                        return lobby;
                    })
                    .then(lobby =>
                        getPokerResult(dependencies, lobbyId)
                            .then(pokerResult => ({
                                lobby,
                                pokerResult,
                            }))
                    )
                    .then(({ lobby, pokerResult}) => {
                        if (pokerResult.every(item => !!item.card)) {
                            return finishPoker(dependencies, lobbyId, pokerResult);
                        }

                        dependencies.subscriptionService.dispatch(lobbyId, {
                            type: EventType.PokerResultWasChanged,
                            payload: { theme: lobby.currentTheme, result: pokerResult },
                        });
                        return Promise.resolve();
                    })
                    .catch(error => {
                        if (error instanceof PokerIsNotStartedError) {
                            console.log(`Trying to dispatch unknown poker result: ${ error.message }`);
                        } else {
                            throw error;
                        }
                    })
                    .then(() => resultValue)
            );
    }
}
