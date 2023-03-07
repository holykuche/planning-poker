import { inject, injectable } from "inversify";

import { TELEGRAM_DAO_TYPES, TelegramMessageDAO } from "data/telegram-data/api";
import { TelegramMessage } from "data/telegram-data/entity";
import { TelegramMessageType } from "data/telegram-data/enum";

import { TelegramMessageService } from "../api";

@injectable()
export default class TelegramMessageServiceImpl implements TelegramMessageService {

    @inject(TELEGRAM_DAO_TYPES.TelegramMessageDAO) private readonly telegramMessageDAO: TelegramMessageDAO;

    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage {
        return this.telegramMessageDAO.getMessage(lobbyId, chatId, messageType);
    }

    getMessages(lobbyId: number, messageType: TelegramMessageType): TelegramMessage[] {
        return this.telegramMessageDAO.getAllMessages(lobbyId)
            .filter(msg => msg.messageType === messageType);
    }

    addMessage(message: TelegramMessage): void {
        this.telegramMessageDAO.addMessage(message);
    }

    deleteMessageById(messageId: number): void {
        this.telegramMessageDAO.deleteMessageById(messageId);
    }

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): void {
        this.telegramMessageDAO.deleteMessages(lobbyId, messageType);
    }

    deleteAllMessages(lobbyId: number): void {
        this.telegramMessageDAO.deleteAllMessages(lobbyId);
    }

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void {
        this.telegramMessageDAO.deleteAllMessagesFromChat(lobbyId, chatId);
    }

}
