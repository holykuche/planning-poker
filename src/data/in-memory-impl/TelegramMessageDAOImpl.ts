import { injectable } from "inversify";

import { TelegramMessageDAO } from "../api";
import { TelegramMessageKey } from "../entity";
import { TelegramMessageType } from "../enum";

@injectable()
export default class TelegramMessageDAOImpl implements TelegramMessageDAO {

    private MESSAGE_KEYS_BY_LOBBY_ID: Record<TelegramMessageType, Map<number, TelegramMessageKey[]>> = {
        [ TelegramMessageType.Lobby ]: new Map<number, TelegramMessageKey[]>(),
        [ TelegramMessageType.Members ]: new Map<number, TelegramMessageKey[]>(),
        [ TelegramMessageType.Result ]: new Map<number, TelegramMessageKey[]>(),
    };

    getMessageKeys(lobbyId: number, messageType: TelegramMessageType): TelegramMessageKey[] {
        return (this.MESSAGE_KEYS_BY_LOBBY_ID[ messageType ].get(lobbyId) || []).map(key => ({ ...key }));
    }

    getAllMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return Object.values(this.MESSAGE_KEYS_BY_LOBBY_ID)
            .map(messageKeys => messageKeys.get(lobbyId))
            .flat();
    }

    addMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMessageKeys(lobbyId, messageType);
        this.MESSAGE_KEYS_BY_LOBBY_ID[ messageType ].set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMessageKeys(lobbyId, messageType)
            .filter(key => !TelegramMessageDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.MESSAGE_KEYS_BY_LOBBY_ID[ messageType ].set(lobbyId, messageKeys);
        } else {
            this.MESSAGE_KEYS_BY_LOBBY_ID[ messageType ].delete(lobbyId);
        }
    }

    deleteMessageKeys(lobbyId: number, messageType: TelegramMessageType): void {
        this.MESSAGE_KEYS_BY_LOBBY_ID[ messageType ].delete(lobbyId);
    }

    deleteAllMessageKeys(lobbyId: number): void {
        Object.values(this.MESSAGE_KEYS_BY_LOBBY_ID)
            .forEach(messageKeys => messageKeys.delete(lobbyId));
    }

    deleteAllMessageKeysFromChat(lobbyId: number, chatId: number): void {
        Object.entries(this.MESSAGE_KEYS_BY_LOBBY_ID)
            .filter(([ , msgKeys ]) => msgKeys.has(lobbyId))
            .map(([ msgType, msgKeys ]) => [ msgType, msgKeys.get(lobbyId) ] as [ TelegramMessageType, TelegramMessageKey[] ])
            .forEach(([ msgType, msgKeys ]) => {
                const newMessageKeys = msgKeys.filter(mk => mk.chatId !== chatId);
                if (newMessageKeys.length) {
                    this.MESSAGE_KEYS_BY_LOBBY_ID[ msgType ].set(lobbyId, newMessageKeys);
                } else {
                    this.MESSAGE_KEYS_BY_LOBBY_ID[ msgType ].delete(lobbyId);
                }
            });
    }

    private static isMessageKeysEquals(left: TelegramMessageKey, right: TelegramMessageKey): boolean {
        return left.chatId === right.chatId && left.messageId === right.messageId;
    }

}