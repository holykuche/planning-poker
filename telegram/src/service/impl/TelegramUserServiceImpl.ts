import {inject, injectable} from 'inversify';

import {DAO_TYPES, TelegramUserDAO} from '@/data/api';

import {MemberService, SERVICE_TYPES, TelegramUserService} from '../api';
import {TelegramMemberDto} from '../dto';
import {MemberIsAlreadyInLobbyError, UnknownMemberError} from '../error';

@injectable()
export default class TelegramUserServiceImpl implements TelegramUserService {
  @inject(DAO_TYPES.TelegramUserDAO)
  private readonly telegramUserDAO: TelegramUserDAO;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  getMemberByTelegramUserId(
    telegram_user_id: number
  ): Promise<TelegramMemberDto> {
    return this.telegramUserDAO
      .getMemberIdByTelegramUserId(telegram_user_id)
      .then(member_id => {
        if (!member_id) {
          throw new UnknownMemberError();
        }

        return this.memberService.getById(member_id);
      })
      .then(member => {
        if (!member) {
          throw new UnknownMemberError();
        }

        return {...member, telegram_user_id: telegram_user_id};
      });
  }

  createMember(member: TelegramMemberDto): Promise<TelegramMemberDto> {
    return this.telegramUserDAO
      .getMemberIdByTelegramUserId(member.telegram_user_id)
      .then(async existedMemberId => {
        if (existedMemberId) {
          const existedMember =
            await this.memberService.getById(existedMemberId);
          throw new MemberIsAlreadyInLobbyError(existedMember.name);
        }
      })
      .then(() => this.memberService.save(member))
      .then(storedMember => ({
        ...storedMember,
        telegram_user_id: member.telegram_user_id,
      }))
      .then(storedMember =>
        this.telegramUserDAO
          .bindTelegramUserWithMember(
            storedMember.telegram_user_id,
            storedMember.id!
          )
          .then(() => storedMember)
      );
  }

  isMemberExists(telegram_user_id: number): Promise<boolean> {
    return this.telegramUserDAO.isMemberExists(telegram_user_id);
  }

  deleteMemberByMemberId(member_id: number): Promise<void> {
    return this.telegramUserDAO
      .unbindMemberFromTelegramUser(member_id)
      .then(() => this.memberService.deleteById(member_id));
  }

  deleteMemberByTelegramUserId(telegram_user_id: number): Promise<void> {
    return this.telegramUserDAO
      .getMemberIdByTelegramUserId(telegram_user_id)
      .then(member_id => this.memberService.deleteById(member_id!))
      .then(() =>
        this.telegramUserDAO.unbindTelegramUserFromMember(telegram_user_id)
      );
  }
}
