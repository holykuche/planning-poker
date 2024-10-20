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

  async getMemberIdByTelegramUserId(
    telegram_user_id: number
  ): Promise<number | null> {
    const member = await this.find('telegram_user_id', telegram_user_id);
    return member?.member_id || null;
  }

  async getTelegramUserIdByMemberId(member_id: number): Promise<number | null> {
    const member = await this.find('member_id', member_id);
    return member?.telegram_user_id || null;
  }

  async isMemberExists(telegram_user_id: number): Promise<boolean> {
    const member = await this.find('telegram_user_id', telegram_user_id);
    return !!member;
  }

  async bindTelegramUserWithMember(
    telegram_user_id: number,
    member_id: number
  ): Promise<void> {
    await this.save({telegram_user_id, member_id});
  }

  unbindTelegramUserFromMember(telegram_user_id: number): Promise<void> {
    return this.delete('telegram_user_id', telegram_user_id);
  }

  unbindMemberFromTelegramUser(member_id: number): Promise<void> {
    return this.delete('member_id', member_id);
  }
}
