import {injectable} from 'inversify';

import {TelegramUserDAO} from '../api';
import {TelegramUserMemberXref} from '../entity';
import {TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class TelegramUserDAOImpl
  extends AbstractDAOImpl<TelegramUserMemberXref>
  implements TelegramUserDAO
{
  constructor() {
    super(TableName.TelegramUserMemberXref);
  }

  getMemberIdByTelegramUserId(telegramUserId: number): Promise<number> {
    return this.find('telegramUserId', telegramUserId).then(
      xref => xref?.memberId || null
    );
  }

  getTelegramUserIdByMemberId(memberId: number): Promise<number> {
    return this.find('memberId', memberId).then(
      xref => xref?.telegramUserId || null
    );
  }

  isMemberExists(telegramUserId: number): Promise<boolean> {
    return this.find('telegramUserId', telegramUserId).then(xref => !!xref);
  }

  async bindTelegramUserWithMember(
    telegramUserId: number,
    memberId: number
  ): Promise<void> {
    await this.save({telegramUserId, memberId});
  }

  unbindTelegramUserFromMember(telegramUserId: number): Promise<void> {
    return this.delete('telegramUserId', telegramUserId);
  }

  unbindMemberFromTelegramUser(memberId: number): Promise<void> {
    return this.delete('memberId', memberId);
  }
}
