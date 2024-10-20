import {Member} from '@/grpc-client/entity';
import {PokerResultItemDto} from '@/service/dto';

import {Emoji} from '../enum';

import bold from './bold';
import escape from './escape';
import italic from './italic';
import membersComparatorFactory from './membersComparatorFactory';

export default function <TMember extends Member>(
  items: PokerResultItemDto<TMember>[],
  member_id: number
): string {
  const isAllMembersVoted = items.every(item => !!item.card);
  const membersComparator = membersComparatorFactory(member_id);

  return items
    .sort((left, right) => membersComparator(left.member, right.member))
    .map(({member, card}) => {
      let cardLabel;

      if (isAllMembersVoted || member.id === member_id) {
        cardLabel = card?.label || Emoji.ThinkingFace;
      } else {
        cardLabel = card ? Emoji.ElectricLampBulb : Emoji.ThinkingFace;
      }

      const memberName =
        member.id === member_id
          ? bold(italic(escape(member.name)))
          : italic(escape(member.name));

      return `${memberName}: ${italic(cardLabel)}`;
    })
    .join('\n');
}
