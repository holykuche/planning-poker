import isTelegramMember from '@/bot/utils/isTelegramMember';
import {Card, Member} from '@/grpc-client/entity';
import {CardCode} from '@/grpc-client/enum';
import {PokerResultItemDto} from '@/service/dto';

import bold from './bold';
import compareCards from './compareCards';
import escape from './escape';
import italic from './italic';
import membersComparatorFactory from './membersComparatorFactory';

export default function <TMember extends Member>(
  theme: string,
  items: PokerResultItemDto<TMember>[],
  telegram_user_id: number
): string {
  const membersByCard = items
    .sort((left, right) => compareCards(left.card, right.card))
    .reduce(
      (byCard, item) => ({
        ...byCard,
        [item.card.code]: (byCard[item.card.code] || []).concat(item.member),
      }),
      {} as Record<CardCode, TMember[]>
    );
  const cardsByCode = items
    .map(item => item.card)
    .reduce(
      (byCode, card) => ({
        ...byCode,
        [card.code]: card,
      }),
      {} as Record<CardCode, Card>
    );

  const membersComparator = membersComparatorFactory(telegram_user_id);
  const result = Object.entries<TMember[]>(membersByCard)
    .map(([cardCode, members]) => ({
      cardCode,
      members: members
        .sort(membersComparator)
        .map(m =>
          isTelegramMember(m) && m.telegram_user_id === telegram_user_id
            ? bold(italic(escape(m.name)))
            : italic(escape(m.name))
        )
        .join(', '),
    }))
    .map(({cardCode, members}) => `${cardsByCode[cardCode].label}: ${members}`)
    .join('\n');

  return `Theme: ${italic(escape(theme))}\n\n${result}`;
}
