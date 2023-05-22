import { TelegramMessage } from "../entity";
import { TelegramMessageType } from "../enum";

export default interface TelegramMessageDAO {

    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): Promise<TelegramMessage>;

    getAllMessages(lobbyId: number): Promise<TelegramMessage[]>;

    addMessage(message: TelegramMessage): Promise<TelegramMessage>;

    deleteMessageById(id: number): Promise<void>;

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): Promise<void>;

    deleteAllMessages(lobbyId: number): Promise<void>;

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): Promise<void>;

}
