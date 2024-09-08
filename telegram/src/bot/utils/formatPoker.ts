import {PokerResultItemDto} from '@/service/dto';

import escape from './escape';
import formatPokerResult from './formatPokerResult';
import italic from './italic';

export default function (
  theme: string,
  items: PokerResultItemDto[],
  memberId: number
): string {
  return (
    `Theme: ${italic(escape(theme))}\n\n` + formatPokerResult(items, memberId)
  );
}
