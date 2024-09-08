import {TelegramMessage} from '@/data/entity';
import {TelegramMessageType} from '@/data/enum';

export default interface TelegramMessageService {
  getMessage(
    lobbyId: number,
    chatId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage>;

  getMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage[]>;

  addMessage(message: TelegramMessage): Promise<void>;

  deleteMessageById(messageId: number): Promise<void>;

  deleteMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<void>;

  deleteAllMessages(lobbyId: number): Promise<void>;

  deleteAllMessagesFromChat(lobbyId: number, chatId: number): Promise<void>;
}
