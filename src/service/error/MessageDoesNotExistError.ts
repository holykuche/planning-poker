import { Lobby } from "data/entity";
import { TelegramMessageType } from "data/enum";

export default class MessageDoesNotExistError extends Error {
    constructor(messageType: TelegramMessageType, lobby: Lobby, chatId: number) {
        super(`${messageType} message doesn't exist for lobby "${lobby.name}" and chat_id "${chatId}"`);
    }
}
