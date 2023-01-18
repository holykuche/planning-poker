import { injectable } from "inversify";

import { TelegramDataDAO } from "../api";
import { TelegramMessageKey } from "../entity";

@injectable()
export default class TelegramDataDAOImpl implements TelegramDataDAO {

    private MEMBERS_MESSAGE_KEYS = new Map<number, TelegramMessageKey[]>();
    private RESULT_MESSAGE_KEYS = new Map<number, TelegramMessageKey[]>();

    getMembersMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return (this.MEMBERS_MESSAGE_KEYS.get(lobbyId) || []).map(key => ({ ...key }));
    }

    addMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMembersMessageKeys(lobbyId);
        this.MEMBERS_MESSAGE_KEYS.set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMembersMessageKeys(lobbyId)
            .filter(key => !TelegramDataDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.MEMBERS_MESSAGE_KEYS.set(lobbyId, messageKeys);
        } else {
            this.MEMBERS_MESSAGE_KEYS.delete(lobbyId);
        }
    }

    deleteAllMembersMessageKeys(lobbyId: number): void {
        this.MEMBERS_MESSAGE_KEYS.delete(lobbyId);
    }

    getResultMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return (this.RESULT_MESSAGE_KEYS.get(lobbyId) || []).map(key => ({ ...key }));
    }

    addResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getResultMessageKeys(lobbyId);
        this.RESULT_MESSAGE_KEYS.set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getResultMessageKeys(lobbyId)
            .filter(key => !TelegramDataDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.RESULT_MESSAGE_KEYS.set(lobbyId, messageKeys);
        } else {
            this.RESULT_MESSAGE_KEYS.delete(lobbyId);
        }
    }

    deleteAllResultMessageKeys(lobbyId: number): void {
        this.RESULT_MESSAGE_KEYS.delete(lobbyId);
    }

    private static isMessageKeysEquals(left: TelegramMessageKey, right: TelegramMessageKey): boolean {
        return left.chatId === right.chatId && left.messageId === right.messageId;
    }

}