import { TelegramMessageKey } from "../entity";

export default interface TelegramDataDAO {
    getMembersMessageKeys: (lobbyId: number) => TelegramMessageKey[];
    addMembersMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteMembersMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteAllMembersMessageKeys: (lobbyId: number) => void;

    getResultMessageKeys: (lobbyId: number) => TelegramMessageKey[];
    addResultMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteResultMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteAllResultMessageKeys: (lobbyId: number) => void;

    getMemberIdByTelegramUserId: (telegramUserId: number) => number;
    getTelegramUserIdByMemberId: (memberId: number) => number;
    bindTelegramUserWithMember: (telegramUserId: number, memberId: number) => void;
    unbindTelegramUserFromMember: (telegramUserId: number) => void;
    unbindMemberFromTelegramUser: (memberId: number) => void;
}
