import {TelegramMemberDto} from '@/service/dto';

import bold from './bold';
import escape from './escape';
import italic from './italic';
import membersComparatorFactory from './membersComparatorFactory';

export default function (
  lobbyName: string,
  members: TelegramMemberDto[],
  telegramUserId: number
): string {
  const membersComparator = membersComparatorFactory(telegramUserId);
  const membersStr = members
    .sort(membersComparator)
    .map(m =>
      m.telegramUserId === telegramUserId
        ? bold(italic(escape(m.name)))
        : italic(escape(m.name))
    )
    .join(', ');
  return `Lobby: ${italic(escape(lobbyName))}\nMembers: ${membersStr}`;
}
