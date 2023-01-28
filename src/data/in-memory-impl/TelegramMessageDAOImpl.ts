import { injectable } from "inversify";

import { TelegramMessageDAO } from "../api";
import { TelegramMessageKey } from "../entity";
import { TelegramMessageType } from "../enum";

@injectable()
export default class TelegramMessageDAOImpl implements TelegramMessageDAO {

    private messageKeysByLobbyId: Record<TelegramMessageType, Map<number, TelegramMessageKey[]>> = {
        [ TelegramMessageType.Lobby ]: new Map<number, TelegramMessageKey[]>(),
        [ TelegramMessageType.Poker ]: new Map<number, TelegramMessageKey[]>(),
    };

    getMessageKeys(lobbyId: number, messageType: TelegramMessageType): TelegramMessageKey[] {
        return (this.messageKeysByLobbyId[ messageType ].get(lobbyId) || []).map(key => ({ ...key }));
    }

    getAllMessageKeys(lobbyId: number): TelegramMessageKey[] {
        return Object.values(this.messageKeysByLobbyId)
            .map(messageKeys => messageKeys.get(lobbyId))
            .flat();
    }

    addMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMessageKeys(lobbyId, messageType);
        this.messageKeysByLobbyId[ messageType ].set(lobbyId, messageKeys.concat([{ ...messageKey } ]));
    }

    deleteMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        const messageKeys = this.getMessageKeys(lobbyId, messageType)
            .filter(key => !TelegramMessageDAOImpl.isMessageKeysEquals(key, messageKey));

        if (messageKeys.length) {
            this.messageKeysByLobbyId[ messageType ].set(lobbyId, messageKeys);
        } else {
            this.messageKeysByLobbyId[ messageType ].delete(lobbyId);
        }
    }

    deleteMessageKeys(lobbyId: number, messageType: TelegramMessageType): void {
        this.messageKeysByLobbyId[ messageType ].delete(lobbyId);
    }

    deleteAllMessageKeys(lobbyId: number): void {
        Object.values(this.messageKeysByLobbyId)
            .forEach(messageKeys => messageKeys.delete(lobbyId));
    }

    deleteAllMessageKeysFromChat(lobbyId: number, chatId: number): void {
        Object.entries(this.messageKeysByLobbyId)
            .filter(([ , msgKeys ]) => msgKeys.has(lobbyId))
            .map(([ msgType, msgKeys ]) => [ msgType, msgKeys.get(lobbyId) ] as [ TelegramMessageType, TelegramMessageKey[] ])
            .forEach(([ msgType, msgKeys ]) => {
                const newMessageKeys = msgKeys.filter(mk => mk.chatId !== chatId);
                if (newMessageKeys.length) {
                    this.messageKeysByLobbyId[ msgType ].set(lobbyId, newMessageKeys);
                } else {
                    this.messageKeysByLobbyId[ msgType ].delete(lobbyId);
                }
            });
    }

    private static isMessageKeysEquals(left: TelegramMessageKey, right: TelegramMessageKey): boolean {
        return left.chatId === right.chatId && left.messageId === right.messageId;
    }

}