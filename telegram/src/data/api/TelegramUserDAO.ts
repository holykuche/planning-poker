export default interface TelegramUserDAO {
  getMemberIdByTelegramUserId(telegramUserId: number): Promise<number | null>;

  getTelegramUserIdByMemberId(memberId: number): Promise<number | null>;

  isMemberExists(telegramUserId: number): Promise<boolean>;

  bindTelegramUserWithMember(
    telegramUserId: number,
    memberId: number
  ): Promise<void>;

  unbindTelegramUserFromMember(telegramUserId: number): Promise<void>;

  unbindMemberFromTelegramUser(memberId: number): Promise<void>;
}
