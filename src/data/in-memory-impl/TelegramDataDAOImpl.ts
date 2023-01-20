import { injectable } from "inversify";

import { TelegramDataDAO } from "../api";
import { TelegramMessageKey } from "../entity";

@injectable()
export default class TelegramDataDAOImpl implements TelegramDataDAO {

    private MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID = new Map<number, TelegramMessageKey[]>();
    private RESULT_MESSAGE_KEYS_BY_LOBBY_ID = new Map<number, TelegramMessageKey[]>();
    private TELEGRAM_USER_MEMBER_XREF = new Map<number, number>();
    private MEMBER_TELEGRAM_USER_XREF = new Map<number, number>();

    getMembersMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return (this.MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID.get(lobbyId) || []).map(key => ({ ...key }));
    }

    addMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMembersMessageKeys(lobbyId);
        this.MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID.set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMembersMessageKeys(lobbyId)
            .filter(key => !TelegramDataDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID.set(lobbyId, messageKeys);
        } else {
            this.MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID.delete(lobbyId);
        }
    }

    deleteAllMembersMessageKeys(lobbyId: number): void {
        this.MEMBERS_MESSAGE_KEYS_BY_LOBBY_ID.delete(lobbyId);
    }

    getResultMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return (this.RESULT_MESSAGE_KEYS_BY_LOBBY_ID.get(lobbyId) || []).map(key => ({ ...key }));
    }

    addResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getResultMessageKeys(lobbyId);
        this.RESULT_MESSAGE_KEYS_BY_LOBBY_ID.set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getResultMessageKeys(lobbyId)
            .filter(key => !TelegramDataDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.RESULT_MESSAGE_KEYS_BY_LOBBY_ID.set(lobbyId, messageKeys);
        } else {
            this.RESULT_MESSAGE_KEYS_BY_LOBBY_ID.delete(lobbyId);
        }
    }

    deleteAllResultMessageKeys(lobbyId: number): void {
        this.RESULT_MESSAGE_KEYS_BY_LOBBY_ID.delete(lobbyId);
    }

    getMemberIdByTelegramUserId(telegramUserId: number): number {
        return this.TELEGRAM_USER_MEMBER_XREF.get(telegramUserId);
    }

    getTelegramUserIdByMemberId(memberId: number): number {
        return this.MEMBER_TELEGRAM_USER_XREF.get(memberId);
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

    private static isMessageKeysEquals(left: TelegramMessageKey, right: TelegramMessageKey): boolean {
        return left.chatId === right.chatId && left.messageId === right.messageId;
    }

}