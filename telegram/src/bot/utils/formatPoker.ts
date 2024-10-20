import {Member} from '@/grpc-client/entity';
import {PokerResultItemDto} from '@/service/dto';

import escape from './escape';
import formatPokerResult from './formatPokerResult';
import italic from './italic';

export default function <TMember extends Member>(
  theme: string,
  items: PokerResultItemDto<TMember>[],
  memberId: number
): string {
  return (
    `Theme: ${italic(escape(theme))}\n\n` + formatPokerResult(items, memberId)
  );
}
