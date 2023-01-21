export default interface TelegramUserDAO {
    getMemberIdByTelegramUserId: (telegramUserId: number) => number;
    getTelegramUserIdByMemberId: (memberId: number) => number;
    bindTelegramUserWithMember: (telegramUserId: number, memberId: number) => void;
    unbindTelegramUserFromMember: (telegramUserId: number) => void;
    unbindMemberFromTelegramUser: (memberId: number) => void;
}
