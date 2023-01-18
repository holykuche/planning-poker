import { inject, injectable } from "inversify";

import { TelegramMessageKey } from "data/entity";
import { DAO_TYPES, LobbyDAO, TelegramDataDAO } from "data/api";

import { TelegramDataService } from "../api";
import { MessageDoesNotExistError } from "../error";

@injectable()
export default class TelegramDataServiceImpl implements TelegramDataService {

    @inject(DAO_TYPES.TelegramDataDAO) private readonly telegramDataDAO: TelegramDataDAO;
    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;

    getMembersMessageId(lobbyId: number, chatId: number): number {
        const messageKey = this.telegramDataDAO.getMembersMessageKeys(lobbyId)
            .find(key => key.chatId === chatId);

        if (!messageKey) {
            const lobby = this.lobbyDAO.getById(lobbyId);
            throw new MessageDoesNotExistError("Members", lobby, chatId);
        }

        return messageKey.messageId;
    }

    addMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.addMembersMessageKey(lobbyId, messageKey);
    }

    deleteMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.deleteMembersMessageKey(lobbyId, messageKey);
    }

    deleteAllMembersMessageKeys(lobbyId: number): void {
        this.telegramDataDAO.deleteAllMembersMessageKeys(lobbyId);
    }

    getResultMessageId(lobbyId: number, chatId: number): number {
        const messageKey = this.telegramDataDAO.getResultMessageKeys(lobbyId)
            .find(key => key.chatId === chatId);

        if (!messageKey) {
            const lobby = this.lobbyDAO.getById(lobbyId);
            throw new MessageDoesNotExistError("Result", lobby, chatId);
        }

        return messageKey.messageId;
    }

    addResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.addResultMessageKey(lobbyId, messageKey);
    }

    deleteResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.deleteResultMessageKey(lobbyId, messageKey);
    }

    deleteAllResultMessageKeys(lobbyId: number): void {
        this.telegramDataDAO.deleteAllResultMessageKeys(lobbyId);
    }

}