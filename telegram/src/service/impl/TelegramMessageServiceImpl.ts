import {inject, injectable} from 'inversify';

import {DAO_TYPES, TelegramMessageDAO} from '@/data/api';
import {TelegramMessage} from '@/data/entity';
import {TelegramMessageType} from '@/data/enum';

import {TelegramMessageService} from '../api';

import AbstractServiceImpl from './AbstractServiceImpl';

@injectable()
export default class TelegramMessageServiceImpl
  extends AbstractServiceImpl
  implements TelegramMessageService
{
  @inject(DAO_TYPES.TelegramMessageDAO)
  private readonly telegramMessageDAO: TelegramMessageDAO;

  getMessage(
    lobby_id: number,
    chat_id: number,
    message_type: TelegramMessageType
  ): Promise<TelegramMessage> {
    return this.telegramMessageDAO
      .getMessage(lobby_id, chat_id, message_type)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  getMessages(
    lobby_id: number,
    message_type: TelegramMessageType
  ): Promise<TelegramMessage[]> {
    return this.telegramMessageDAO
      .getAllMessages(lobby_id)
      .then(messages =>
        messages.filter(msg => msg.message_type === message_type)
      )
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  async addMessage(message: TelegramMessage): Promise<void> {
    await this.telegramMessageDAO
      .addMessage(message)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteMessageById(message_id: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteMessageById(message_id)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteMessages(
    lobby_id: number,
    message_type: TelegramMessageType
  ): Promise<void> {
    return this.telegramMessageDAO
      .deleteMessages(lobby_id, message_type)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteAllMessages(lobby_id: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteAllMessages(lobby_id)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteAllMessagesFromChat(lobby_id: number, chat_id: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteAllMessagesFromChat(lobby_id, chat_id)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }
}
