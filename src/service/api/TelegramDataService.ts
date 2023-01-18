import { TelegramMessageKey } from "data/entity";

export default interface TelegramDataService {
    getMembersMessageId: (lobbyId: number, chatId: number) => number;
    addMembersMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteMembersMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteAllMembersMessageKeys: (lobbyId: number) => void;

    getResultMessageId: (lobbyId: number, chatId: number) => number;
    addResultMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteResultMessageKey: (lobbyId: number, messageKey: TelegramMessageKey) => void;
    deleteAllResultMessageKeys: (lobbyId: number) => void;
}
