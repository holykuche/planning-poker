import { injectable } from "inversify";

import { TelegramUserDAO } from "../api";

@injectable()
export default class TelegramUserDAOImpl implements TelegramUserDAO {

    private TELEGRAM_USER_MEMBER_XREF = new Map<number, number>();
    private MEMBER_TELEGRAM_USER_XREF = new Map<number, number>();

    getMemberIdByTelegramUserId(telegramUserId: number): number {
        return this.TELEGRAM_USER_MEMBER_XREF.get(telegramUserId);
    }

    getTelegramUserIdByMemberId(memberId: number): number {
        return this.MEMBER_TELEGRAM_USER_XREF.get(memberId);
    }

    isMemberExist(telegramUserId: number): boolean {
        return this.TELEGRAM_USER_MEMBER_XREF.has(telegramUserId);
    }

    bindTelegramUserWithMember(telegramUserId: number, memberId: number): void {
        this.TELEGRAM_USER_MEMBER_XREF.set(telegramUserId, memberId);
        this.MEMBER_TELEGRAM_USER_XREF.set(memberId, telegramUserId);
    }

    unbindTelegramUserFromMember(telegramUserId: number): void {
        const memberId = this.TELEGRAM_USER_MEMBER_XREF.get(telegramUserId);
        this.TELEGRAM_USER_MEMBER_XREF.delete(telegramUserId);
        this.MEMBER_TELEGRAM_USER_XREF.delete(memberId);
    }

    unbindMemberFromTelegramUser(memberId: number): void {
        const telegramUserId = this.MEMBER_TELEGRAM_USER_XREF.get(memberId);
        this.MEMBER_TELEGRAM_USER_XREF.delete(memberId);
        this.TELEGRAM_USER_MEMBER_XREF.delete(telegramUserId);
    }
}