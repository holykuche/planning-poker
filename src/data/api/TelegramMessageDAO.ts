import { TelegramMessage } from "../entity";
import { TelegramMessageType } from "../enum";

export default interface TelegramMessageDAO {
    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage;
    getAllMessages(lobbyId: number): TelegramMessage[];
    addMessage(message: TelegramMessage): void;
    deleteMessageById(id: number): void;
    deleteMessage(lobbyId: number, messageType: TelegramMessageType): void;
    deleteAllMessages(lobbyId: number): void;
    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void;
}
