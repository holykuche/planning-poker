import { TelegramMessageKey } from "../entity";
import { TelegramMessageType } from "../enum";

export default interface TelegramMessageDAO {
    getMessageKeys(lobbyId: number, messageType: TelegramMessageType): TelegramMessageKey[];
    getAllMessageKeys(lobbyId: number): TelegramMessageKey[];
    addMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void;
    deleteMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void;
    deleteMessageKeys(lobbyId: number, messageType: TelegramMessageType): void;
    deleteAllMessageKeys(lobbyId: number): void;
    deleteAllMessageKeysFromChat(lobbyId: number, chatId: number): void;
}
