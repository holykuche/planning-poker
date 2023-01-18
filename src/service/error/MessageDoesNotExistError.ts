import { Lobby } from "data/entity";

export default class MessageDoesNotExistError extends Error {
    constructor(messageTypeLabel: string, lobby: Lobby, chatId: number) {
        super(`${messageTypeLabel} message doesn't exist for lobby "${lobby.name}" and chat_id "${chatId}"`);
    }
}
