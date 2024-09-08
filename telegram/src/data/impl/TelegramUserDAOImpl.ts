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

  async getMemberIdByTelegramUserId(telegramUserId: number): Promise<number> {
    const member = await this.find('telegramUserId', telegramUserId);
    return member?.memberId || null;
  }

  async getTelegramUserIdByMemberId(memberId: number): Promise<number> {
    const member = await this.find('memberId', memberId);
    return member.telegramUserId || null;
  }

  async isMemberExists(telegramUserId: number): Promise<boolean> {
    const member = await this.find('telegramUserId', telegramUserId);
    return !!member;
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
