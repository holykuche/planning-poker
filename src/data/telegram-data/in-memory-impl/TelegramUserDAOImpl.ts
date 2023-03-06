import { injectable } from "inversify";

import { AbstractInMemoryDAOImpl } from "data/base-data/in-memory-impl";

import { TelegramUserDAO } from "../api";
import { TelegramUserMemberXref } from "../entity";

@injectable()
export default class TelegramUserDAOImpl extends AbstractInMemoryDAOImpl<TelegramUserMemberXref> implements TelegramUserDAO {

    constructor() {
        super({
            indexBy: [ "telegramUserId", "memberId" ],
        });
    }

    getMemberIdByTelegramUserId(telegramUserId: number): number {
        return this.find("telegramUserId", telegramUserId)?.memberId || null;
    }

    getTelegramUserIdByMemberId(memberId: number): number {
        return this.find("memberId", memberId)?.telegramUserId || null;
    }

    isMemberExists(telegramUserId: number): boolean {
        return !!this.find("telegramUserId", telegramUserId);
    }

    bindTelegramUserWithMember(telegramUserId: number, memberId: number): void {
        this.save({ telegramUserId, memberId });
    }

    unbindTelegramUserFromMember(telegramUserId: number): void {
        this.delete("telegramUserId", telegramUserId);
    }

    unbindMemberFromTelegramUser(memberId: number): void {
        this.delete("memberId", memberId);
    }
}