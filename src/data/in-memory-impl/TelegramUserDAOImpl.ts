import { injectable } from "inversify";

import { TelegramUserDAO } from "../api";
import { TelegramUserMemberXref } from "../entity";

import AbstractInMemoryDAOImpl from "./AbstractInMemoryDAOImpl";

@injectable()
export default class TelegramUserDAOImpl extends AbstractInMemoryDAOImpl<TelegramUserMemberXref> implements TelegramUserDAO {

    constructor() {
        super({
            indexBy: [ "telegramUserId", "memberId" ],
        });
    }

    getMemberIdByTelegramUserId(telegramUserId: number): number {
        return this.find("telegramUserId", telegramUserId)?.memberId;
    }

    getTelegramUserIdByMemberId(memberId: number): number {
        return this.find("memberId", memberId)?.telegramUserId;
    }

    isMemberExisted(telegramUserId: number): boolean {
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