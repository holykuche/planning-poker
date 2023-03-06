import { injectable } from "inversify";

import { AbstractInMemoryDAOImpl } from "data/base-data/in-memory-impl";

import { TelegramMessageDAO } from "../api";
import { TelegramMessage } from "../entity";
import { TelegramMessageType } from "../enum";

@injectable()
export default class TelegramMessageDAOImpl extends AbstractInMemoryDAOImpl<TelegramMessage, "id"> implements TelegramMessageDAO {

    constructor() {
        super({
            primaryKey: "id",
            indexBy: [ "lobbyId" ],
            initialPrimaryKeyValue: 1,
            getNextPrimaryKeyValue: current => current + 1,
        });
    }

    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage {
        return this.findMany("lobbyId", lobbyId)
                .find(message => message.chatId === chatId && message.messageType === messageType)
            || null;
    }

    getAllMessages(lobbyId: number): TelegramMessage[] {
        return this.findMany("lobbyId", lobbyId);
    }

    addMessage(message: TelegramMessage): TelegramMessage {
        return this.save(message);
    }

    deleteMessageById(id: number): void {
        this.delete("id", id);
    }

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): void {
        this.findMany("lobbyId", lobbyId)
            .filter(message => message.messageType === messageType)
            .map(message => message.id)
            .forEach(id => this.delete("id", id));
    }

    deleteAllMessages(lobbyId: number): void {
        this.delete("lobbyId", lobbyId);
    }

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void {
        this.findMany("lobbyId", lobbyId)
            .filter(message => message.chatId === chatId)
            .map(message => message.id)
            .forEach(id => this.delete("id", id));
    }

}