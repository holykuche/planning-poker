import {Member} from '@/grpc-client/entity';

import bold from './bold';
import escape from './escape';
import isTelegramMember from './isTelegramMember';
import italic from './italic';
import membersComparatorFactory from './membersComparatorFactory';

export default function <TMember extends Member>(
  lobby_name: string,
  members: TMember[],
  telegram_user_id: number
): string {
  const membersComparator = membersComparatorFactory(telegram_user_id);
  const membersStr = members
    .sort(membersComparator)
    .map(m =>
      isTelegramMember(m) && m.telegram_user_id === telegram_user_id
        ? bold(italic(escape(m.name)))
        : italic(escape(m.name))
    )
    .join(', ');
  return `Lobby: ${italic(escape(lobby_name))}\nMembers: ${membersStr}`;
}
