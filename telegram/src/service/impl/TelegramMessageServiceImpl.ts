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
    lobbyId: number,
    chatId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage> {
    return this.telegramMessageDAO
      .getMessage(lobbyId, chatId, messageType)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  getMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage[]> {
    return this.telegramMessageDAO
      .getAllMessages(lobbyId)
      .then(messages => messages.filter(msg => msg.messageType === messageType))
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  async addMessage(message: TelegramMessage): Promise<void> {
    await this.telegramMessageDAO
      .addMessage(message)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteMessageById(messageId: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteMessageById(messageId)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<void> {
    return this.telegramMessageDAO
      .deleteMessages(lobbyId, messageType)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteAllMessages(lobbyId: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteAllMessages(lobbyId)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }

  deleteAllMessagesFromChat(lobbyId: number, chatId: number): Promise<void> {
    return this.telegramMessageDAO
      .deleteAllMessagesFromChat(lobbyId, chatId)
      .catch(TelegramMessageServiceImpl.handleGrpcError);
  }
}
