import { injectable } from "inversify";

import { TelegramUserDAO } from "../api";

@injectable()
export default class TelegramUserDAOImpl implements TelegramUserDAO {

    private telegramUserMemberXref = new Map<number, number>();
    private memberTelegramUserXref = new Map<number, number>();

    getMemberIdByTelegramUserId(telegramUserId: number): number {
        return this.telegramUserMemberXref.get(telegramUserId);
    }

    getTelegramUserIdByMemberId(memberId: number): number {
        return this.memberTelegramUserXref.get(memberId);
    }

    isMemberExisted(telegramUserId: number): boolean {
        return this.telegramUserMemberXref.has(telegramUserId);
    }

    bindTelegramUserWithMember(telegramUserId: number, memberId: number): void {
        this.telegramUserMemberXref.set(telegramUserId, memberId);
        this.memberTelegramUserXref.set(memberId, telegramUserId);
    }

    unbindTelegramUserFromMember(telegramUserId: number): void {
        const memberId = this.telegramUserMemberXref.get(telegramUserId);
        this.telegramUserMemberXref.delete(telegramUserId);
        this.memberTelegramUserXref.delete(memberId);
    }

    unbindMemberFromTelegramUser(memberId: number): void {
        const telegramUserId = this.memberTelegramUserXref.get(memberId);
        this.memberTelegramUserXref.delete(memberId);
        this.telegramUserMemberXref.delete(telegramUserId);
    }
}