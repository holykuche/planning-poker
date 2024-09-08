import {inject, injectable} from 'inversify';

import {DAO_TYPES, TelegramMessageDAO} from '@/data/api';
import {TelegramMessage} from '@/data/entity';
import {TelegramMessageType} from '@/data/enum';

import {TelegramMessageService} from '../api';

@injectable()
export default class TelegramMessageServiceImpl
  implements TelegramMessageService
{
  @inject(DAO_TYPES.TelegramMessageDAO)
  private readonly telegramMessageDAO: TelegramMessageDAO;

  getMessage(
    lobbyId: number,
    chatId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage> {
    return this.telegramMessageDAO.getMessage(lobbyId, chatId, messageType);
  }

  getMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage[]> {
    return this.telegramMessageDAO
      .getAllMessages(lobbyId)
      .then(messages =>
        messages.filter(msg => msg.messageType === messageType)
      );
  }

  addMessage(message: TelegramMessage): Promise<void> {
    return this.telegramMessageDAO.addMessage(message).then();
  }

  deleteMessageById(messageId: number): Promise<void> {
    return this.telegramMessageDAO.deleteMessageById(messageId);
  }

  deleteMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<void> {
    return this.telegramMessageDAO.deleteMessages(lobbyId, messageType);
  }

  deleteAllMessages(lobbyId: number): Promise<void> {
    return this.telegramMessageDAO.deleteAllMessages(lobbyId);
  }

  deleteAllMessagesFromChat(lobbyId: number, chatId: number): Promise<void> {
    return this.telegramMessageDAO.deleteAllMessagesFromChat(lobbyId, chatId);
  }
}
