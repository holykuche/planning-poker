import {container} from '@/config/inversify';
import {
  DAO_TYPES,
  LobbyDAO,
  MemberCardXrefDAO,
  MemberDAO,
  MemberLobbyXrefDAO,
} from '@/data/api';
import {Card} from '@/data/entity';
import {CardCode, LobbyState} from '@/data/enum';

import {SERVICE_TYPES, SubscriptionService, CardService} from '../../api';
import {PokerResultItemDto} from '../../dto';
import {EventType} from '../../event';
import {resolveLobbyId} from '../common';

interface Dependencies {
  memberLobbyXrefDAO: MemberLobbyXrefDAO;
  memberCardXrefDAO: MemberCardXrefDAO;
  memberDAO: MemberDAO;
  lobbyDAO: LobbyDAO;
  subscriptionService: SubscriptionService;
  cardService: CardService;
}

const getPokerResult = async (
  dependencies: Dependencies,
  lobbyId: number
): Promise<PokerResultItemDto[]> => {
  const memberIds =
    await dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
  const members = await dependencies.memberDAO.getByIds(memberIds);
  const cardXrefs =
    await dependencies.memberCardXrefDAO.getCardsByMemberIds(memberIds);
  const cards = await dependencies.cardService.getAll().then(allCards =>
    allCards.reduce(
      (cs, c) => ({
        ...cs,
        [c.code]: c,
      }),
      {} as Record<CardCode, Card>
    )
  );

  const memberCards = cardXrefs.reduce(
    (cardsByMemberId, {member_id, card_code}) => ({
      ...cardsByMemberId,
      [member_id]: cards[card_code],
    }),
    {} as Record<number, Card>
  );

  return members.map(member => ({member, card: memberCards[member.id]}));
};

const finishPoker = (
  dependencies: Dependencies,
  lobbyId: number,
  pokerResult: PokerResultItemDto[]
): Promise<void> => {
  return dependencies.lobbyDAO
    .getById(lobbyId)
    .then(lobby =>
      dependencies.lobbyDAO.save({
        ...lobby,
        current_theme: null,
        state: LobbyState.Waiting,
      })
    )
    .then(lobby =>
      dependencies.subscriptionService.dispatch(lobby.id, {
        type: EventType.PokerWasFinished,
        payload: {theme: lobby.current_theme, result: pokerResult},
      })
    )
    .then(() => dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId))
    .then(memberIds =>
      dependencies.memberCardXrefDAO.removeByMemberIds(memberIds)
    );
};

export default (
  target: object,
  propertyKey: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  descriptor: TypedPropertyDescriptor<Function>
) => {
  const method = descriptor.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptor.value = async function (...args: any[]) {
    const result = await method.apply(this, args);

    const dependencies: Dependencies = {
      memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(
        DAO_TYPES.MemberLobbyXrefDAO
      ),
      memberCardXrefDAO: container.get<MemberCardXrefDAO>(
        DAO_TYPES.MemberCardXrefDAO
      ),
      memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
      lobbyDAO: container.get<LobbyDAO>(DAO_TYPES.LobbyDAO),
      subscriptionService: container.get<SubscriptionService>(
        SERVICE_TYPES.SubscriptionService
      ),
      cardService: container.get<CardService>(SERVICE_TYPES.CardService),
    };

    const lobbyId = await resolveLobbyId(
      dependencies,
      args,
      target,
      propertyKey
    );
    const lobby = await dependencies.lobbyDAO.getById(lobbyId);

    if (lobby.state !== LobbyState.Playing) {
      return;
    }

    const pokerResult = await getPokerResult(dependencies, lobby.id);

    if (pokerResult.every(item => !!item.card)) {
      await finishPoker(dependencies, lobby.id, pokerResult);
    } else {
      await dependencies.subscriptionService.dispatch(lobby.id, {
        type: EventType.PokerResultWasChanged,
        payload: {theme: lobby.current_theme, result: pokerResult},
      });
    }

    return result;
  };
};
