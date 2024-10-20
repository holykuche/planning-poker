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
    lobby_id: number,
    chat_id: number,
    message_type: TelegramMessageType
  ): Promise<TelegramMessage | null> {
    return this.telegramMessageDAO.getMessage(lobby_id, chat_id, message_type);
  }

  getMessages(
    lobby_id: number,
    message_type: TelegramMessageType
  ): Promise<TelegramMessage[]> {
    return this.telegramMessageDAO
      .getAllMessages(lobby_id)
      .then(messages =>
        messages.filter(msg => msg.message_type === message_type)
      );
  }

  async addMessage(message: TelegramMessage): Promise<void> {
    await this.telegramMessageDAO.addMessage(message);
  }

  deleteMessageById(message_id: number): Promise<void> {
    return this.telegramMessageDAO.deleteMessageById(message_id);
  }

  deleteMessages(
    lobby_id: number,
    message_type: TelegramMessageType
  ): Promise<void> {
    return this.telegramMessageDAO.deleteMessages(lobby_id, message_type);
  }

  deleteAllMessages(lobby_id: number): Promise<void> {
    return this.telegramMessageDAO.deleteAllMessages(lobby_id);
  }

  deleteAllMessagesFromChat(lobby_id: number, chat_id: number): Promise<void> {
    return this.telegramMessageDAO.deleteAllMessagesFromChat(lobby_id, chat_id);
  }
}
