import { TelegramMessage } from "data/telegram-data/entity";
import { TelegramMessageType } from "data/telegram-data/enum";

export default interface TelegramMessageService {
    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage;

    getMessages(lobbyId: number, messageType: TelegramMessageType): TelegramMessage[];

    addMessage(message: TelegramMessage): void;

    deleteMessageById(messageId: number): void;

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): void;

    deleteAllMessages(lobbyId: number): void;

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void;
}
