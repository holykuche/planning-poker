export default interface TelegramUserDAO {

    getMemberIdByTelegramUserId(telegramUserId: number): Promise<number>;

    getTelegramUserIdByMemberId(memberId: number): Promise<number>;

    isMemberExists(telegramUserId: number): Promise<boolean>;

    bindTelegramUserWithMember(telegramUserId: number, memberId: number): Promise<void>;

    unbindTelegramUserFromMember(telegramUserId: number): Promise<void>;

    unbindMemberFromTelegramUser(memberId: number): Promise<void>;

}
