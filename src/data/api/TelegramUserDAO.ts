export default interface TelegramUserDAO {
    getMemberIdByTelegramUserId(telegramUserId: number): number;
    getTelegramUserIdByMemberId(memberId: number): number;
    isMemberExists(telegramUserId: number): boolean;
    bindTelegramUserWithMember(telegramUserId: number, memberId: number): void;
    unbindTelegramUserFromMember(telegramUserId: number): void;
    unbindMemberFromTelegramUser(memberId: number): void;
}
